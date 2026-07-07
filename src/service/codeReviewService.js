import mongoose from 'mongoose';
import { codeReviewQueue } from '../queues/codeReviewQueue.js';
import { AssignmentSubmission, AssignmentResult, Assignment, Student } from '../models/index.js';
import { createNotification, sendEmail, notifyAdmins } from './notificationService.js';
import { applyPointsEvent } from './pointsService.js';

// Constants for grading and scores
const TOTAL_MARKS = 10;
const PASSING_MARKS = 7;
const API_TIMEOUT_MS = 10000; // 10 seconds timeout

/**
 * Validate if a URL is a valid GitHub repository URL.
 */
function isValidGithubUrl(url) {
  if (!url || typeof url !== 'string') return false;
  // Match standard secure github repository URLs strictly
  const githubRegex = /^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+(?:\.git)?\/?$/;
  return githubRegex.test(url);
}

/**
 * Enqueue a code review job in the Bull queue.
 */
export async function queueReview(submissionId) {
  if (!submissionId) {
    throw new Error('Validation Error: submissionId is required.');
  }

  // 1. Fetch submission from DB
  const submission = await AssignmentSubmission.findById(submissionId);
  if (!submission) {
    throw new Error(`Validation Error: Assignment submission not found with ID "${submissionId}".`);
  }

  // Prevent duplicate review jobs
  if (submission.reviewStatus === 'pending') {
    throw new Error('Review already queued.');
  }

  // 2. Validate GitHub URL
  const githubUrl = submission.gitSubmissionLink;
  if (!isValidGithubUrl(githubUrl)) {
    throw new Error(`Validation Error: Invalid GitHub URL "${githubUrl}" for submission "${submissionId}".`);
  }

  console.log(`[CodeReviewService] Submission ${submissionId} validated. Enqueueing review job...`);

  // 3. Queue the job in Bull with 3 attempts and custom backoff delay
  const job = await codeReviewQueue.add(
    { 
      submissionId
    },
    {
      attempts: 3,
      backoff: {
        type: 'customBackoff'
      },
      removeOnComplete: true,
      removeOnFail: false
    }
  );

  // 4. Update the submission's reviewStatus to pending
  submission.reviewStatus = 'pending';
  await submission.save();

  console.log(`[CodeReviewService] Review queued successfully. Job ID: ${job.id} for submission ${submissionId}`);
  return job;
}

/**
 * Call the external code review API.
 */
export async function callCodeReviewApi(githubUrl, apiUrl) {
  if (!isValidGithubUrl(githubUrl)) {
    throw new Error('Validation Error: Invalid GitHub URL.');
  }

  if (!apiUrl) {
    throw new Error('Configuration Error: CODE_REVIEW_API_URL is not set.');
  }

  const apiKey = process.env.CODE_REVIEW_API_KEY;

  console.log(`[CodeReviewService] Calling external API at ${apiUrl} for ${githubUrl}...`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey ? `Bearer ${apiKey}` : ''
      },
      body: JSON.stringify({ githubUrl }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`External API returned status ${response.status}: ${text}`);
    }

    const data = await response.json();
    console.log('[CodeReviewService] External API Response received:', data);

    // Validate external API response schema
    if (
      data === null ||
      typeof data !== 'object' ||
      typeof data.score !== 'number' ||
      Number.isNaN(data.score)
    ) {
      throw new Error('Invalid API response format');
    }

    if (typeof data.feedback !== 'string') {
      data.feedback = '';
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`[CodeReviewService] External API call failed: ${error.message}`);
    throw error; // Propagate to trigger worker retry
  }
}

/**
 * Handle successful code review result.
 */
export async function handleReviewResult(submissionId, result) {
  console.log(`[CodeReviewService] Processing review result for submission ${submissionId}...`);

  // 1. Fetch submission
  const submission = await AssignmentSubmission.findById(submissionId);
  if (!submission) {
    throw new Error(`Submission ${submissionId} not found during result handling.`);
  }

  // 2. Fetch assignment to check deadline
  const assignment = await Assignment.findById(submission.assignmentId);
  
  // Extract and clamp scores
  const marksObtained = Math.max(0, Math.min(TOTAL_MARKS, Number(result.score) || 0));
  const codeQualityScore = 0;
  const feedback = result.feedback || '';

  // 3. Set points = 0 if submission was late, else points = marksObtained
  const isLate = submission.onTimeSubmission === false || 
    (submission.submittedAt && assignment && new Date(submission.submittedAt) > new Date(assignment.submissionDeadline));
  
  const points = isLate ? 0 : marksObtained;
  const percentage = (marksObtained / TOTAL_MARKS) * 100;
  const bonusPoints = 0;
  const totalPoints = points + bonusPoints;
  
  // 4. Pass/Fail status
  const passFailResult = marksObtained >= PASSING_MARKS ? 'pass' : 'failed';

  let ledgerEntry;
  let assignmentResult;

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // 5. Create AssignmentResult document
      assignmentResult = new AssignmentResult({
        submissionId,
        totalMarks: TOTAL_MARKS,
        marksObtained,
        percentage,
        points,
        bonusPoints,
        totalPoints,
        feedback,
        codeQualityScore,
        evalAt: new Date(),
        result: passFailResult
      });
      await assignmentResult.save({ session });

      // 6. Apply points to student ledger via fallback pointsService
      try {
        ledgerEntry = await applyPointsEvent({
          studentId: submission.studentId,
          sourceType: 'assignment',
          sourceId: assignmentResult._id,
          points,
          description: `Awarded ${points} points for assignment submission ${submissionId}`,
          session
        });
      } catch (ledgerError) {
        console.error(`[CodeReviewService] Error writing ledger event: ${ledgerError.message}`);
        throw ledgerError; // Rethrow to abort the transaction
      }

      // 7. Update Submission reviewStatus & ledgerEventId
      submission.reviewStatus = 'completed';
      if (ledgerEntry) {
        submission.ledgerEventId = ledgerEntry._id;
      }
      await submission.save({ session });
    });
  } catch (error) {
    console.error(`[CodeReviewService] Transaction aborted for submission ${submissionId}: ${error.message}`);
    throw error;
  } finally {
    await session.endSession();
  }

  // 8. Notify student (In-app + Email)
  try {
    const student = await Student.findById(submission.studentId).populate('userId');
    if (student && student.userId) {
      const studentUserId = student.userId._id;
      const studentEmail = student.userId.email;
      const message = `Your code review for assignment submission is completed. Score: ${marksObtained}/${TOTAL_MARKS} (${passFailResult.toUpperCase()}).`;

      await createNotification(studentUserId, 'code_review_completed', message, {
        submissionId,
        marksObtained,
        result: passFailResult
      });

      if (studentEmail) {
        await sendEmail(
          studentEmail,
          `[IMS] Code Review Completed - Score: ${marksObtained}/${TOTAL_MARKS}`,
          `<p>${message}</p><p><strong>Feedback:</strong> ${feedback}</p>`
        );
      }
    }
  } catch (notificationError) {
    console.error(`[CodeReviewService] Failed to notify student: ${notificationError.message}`);
  }

  console.log(`[CodeReviewService] Review success. Results saved for submission ${submissionId}.`);
}

/**
 * Handle code review errors (called when retries are exhausted).
 */
export async function handleReviewError(submissionId, error) {
  console.error(`[CodeReviewService] Final failure for submission ${submissionId}: ${error.message}`);

  try {
    // 1. Set submission status to error
    const submission = await AssignmentSubmission.findById(submissionId);
    if (submission) {
      submission.reviewStatus = 'error';
      await submission.save();
    }

    // Note: marksObtained remains "Pending" by omission of an AssignmentResult document 
    // or by the reviewStatus state until admin override.

    // 2. Notify all 4 admins
    const message = `Critical Code Review Error: Code review job for submission "${submissionId}" failed after 3 attempts. Last error: ${error.message}`;
    await notifyAdmins('code_review_error', message, {
      submissionId,
      error: error.message
    });

    console.log(`[CodeReviewService] Admins successfully notified of code review error for submission ${submissionId}`);
  } catch (handlerError) {
    console.error(`[CodeReviewService] Error executing handleReviewError: ${handlerError.message}`);
  }
}
