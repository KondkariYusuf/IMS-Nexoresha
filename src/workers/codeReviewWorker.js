import { fileURLToPath } from 'url';
import 'dotenv/config';
import { codeReviewQueue } from '../queues/codeReviewQueue.js';
import { AssignmentSubmission } from '../models/index.js';
import { callCodeReviewApi, handleReviewResult, handleReviewError } from '../service/codeReviewService.js';
import { connectDatabase } from '../../config/database.js';

console.log('[CodeReviewWorker] Worker script loaded and listening for queue jobs...');

// Prevent duplicate worker process registration and duplicate event listeners
if (!global.__codeReviewWorkerRegistered) {
  global.__codeReviewWorkerRegistered = true;

  // Process the code-review queue
  codeReviewQueue.process(async (job) => {
    const { submissionId } = job.data;

    console.log(`[CodeReviewWorker] Job ${job.id} started (attempt ${job.attemptsMade + 1}/${job.opts.attempts}). Submission ID: ${submissionId}`);

    try {
      // 1. Fetch submission from database
      const submission = await AssignmentSubmission.findById(submissionId);
      if (!submission) {
        console.warn(`[CodeReviewWorker] Job ${job.id} skipped: Submission "${submissionId}" not found.`);
        return;
      }

      // 2. Extract and validate GitHub URL
      const githubUrl = submission.gitSubmissionLink;
      if (!githubUrl) {
        throw new Error(`Invalid GitHub URL for submission "${submissionId}": URL is missing.`);
      }

      // 3. Call code review API (or mock review mode if API URL is not set)
      const reviewResult = await callCodeReviewApi(githubUrl, process.env.CODE_REVIEW_API_URL);

      // 4. Update DB and Notify student
      await handleReviewResult(submissionId, reviewResult);

      console.log(`[CodeReviewWorker] Job ${job.id} completed successfully.`);
    } catch (error) {
      console.error(`[CodeReviewWorker] Job ${job.id} failed (attempt ${job.attemptsMade + 1}/${job.opts.attempts}): ${error.message}`);
      // Throwing error prompts Bull to perform backoff retries if attempts remain
      throw error;
    }
  });

  // Listen for job failure events to handle final failures when retries are exhausted
  codeReviewQueue.on('failed', async (job, err) => {
    const { submissionId } = job.data;

    // Check if all retries are exhausted
    if (job.attemptsMade >= job.opts.attempts) {
      console.error(`[CodeReviewWorker] Job ${job.id} exhausted all ${job.opts.attempts} attempts. Triggering error handling...`);
      try {
        await handleReviewError(submissionId, err);
        console.log(`[CodeReviewWorker] Error handler completed for job ${job.id}`);
      } catch (handlerError) {
        console.error(`[CodeReviewWorker] Error running handleReviewError: ${handlerError.message}`);
      }
    } else {
      console.warn(`[CodeReviewWorker] Job ${job.id} failed attempt ${job.attemptsMade + 1}/${job.opts.attempts}. Retrying based on backoff strategy...`);
    }
  });
}

// Standalone execution support: allows running the worker directly in a separate process
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectRun) {
  console.log('[CodeReviewWorker] Running in standalone worker mode. Connecting to DB...');
  const DB_URI = process.env.DB_URI || 'mongodb://127.0.0.1:27017/ims';
  try {
    await connectDatabase(DB_URI);
    console.log('[CodeReviewWorker] Connected to database. Standing by for jobs...');
  } catch (error) {
    console.error('[CodeReviewWorker] Database connection failed:', error.message);
    process.exit(1);
  }
}
