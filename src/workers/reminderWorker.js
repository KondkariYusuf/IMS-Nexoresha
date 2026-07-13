import { fileURLToPath } from 'url';
import 'dotenv/config';
import { reminderQueue } from '../queues/reminderQueue.js';
import { Session, Assignment } from '../models/index.js';
import { notifyBatch, notifyAdmins } from '../service/notificationService.js';
import { connectDatabase } from '../../config/database.js';

console.log('[ReminderWorker] Worker script loaded and listening for queue jobs...');

// Process the reminders queue
reminderQueue.process(async (job) => {
  const { sessionId, type, fireAt } = job.data;
  
  console.log(`[ReminderWorker] Job ${job.id} started. Type: ${type}, Session ID: ${sessionId}`);

  try {
    // 1. Fetch Session from Database
    const session = await Session.findById(sessionId);
    if (!session) {
      console.warn(`[ReminderWorker] Job ${job.id} skipped: Session "${sessionId}" not found.`);
      return;
    }

    if (type === 'session_start_auto') {
      if (session.status !== 'scheduled') {
        console.log(`[ReminderWorker] Auto transition skipped: Session "${sessionId}" status is "${session.status}" (expected "scheduled").`);
        return;
      }
      const scheduledTime = new Date(session.sessionDateAndTime).getTime();
      if (Date.now() + 5000 < scheduledTime) {
        console.warn(`[ReminderWorker] Job ${job.id} skipped: Scheduled start time (${session.sessionDateAndTime}) has not been reached yet.`);
        return;
      }
      console.log(`[ReminderWorker] Automatically transitioning session "${session.title}" (${sessionId}) to "In Progress"...`);
      const { transitionSessionStatus } = await import('../service/sessionService.js');
      await transitionSessionStatus(sessionId, 'In Progress');
      console.log(`[ReminderWorker] Job ${job.id} completed successfully. Session transitioned.`);
      return;
    }

    // 2. Check Session Status (Skip if completed or cancelled)
    if (session.status === 'completed' || session.status === 'cancelled') {
      console.log(`[ReminderWorker] Job ${job.id} skipped: Session status is "${session.status}".`);
      return;
    }

    let notifyType = 'session_reminder';
    let message = '';
    let meta = { sessionId, type, fireAt };

    // 3. Formulate message and determine notification type based on job type
    if (type === 'lecture_reminder_24h') {
      notifyType = 'session_reminder';
      message = `Reminder: The session "${session.title}" starts in 24 hours.`;
    } else if (type === 'lecture_reminder_1h') {
      notifyType = 'session_reminder';
      message = `Reminder: The session "${session.title}" starts in 1 hour.`;
    } else if (type === 'assignment_deadline_24h') {
      notifyType = 'assignment_approaching';
      
      // Attempt to find the assignment linked to the session
      const assignment = await Assignment.findOne({ sessionId });
      if (assignment) {
        message = `Reminder: The assignment "${assignment.title}" is due in 24 hours.`;
        meta.assignmentId = assignment._id;
      } else {
        message = `Reminder: The assignment for session "${session.title}" is due in 24 hours.`;
      }
    } else {
      console.warn(`[ReminderWorker] Job ${job.id} skipped: Unsupported reminder type "${type}".`);
      return;
    }

    // 4. Trigger bulk notifications & emails to batch students
    console.log(`[ReminderWorker] Triggering notifyBatch for batch ${session.batchId} (type: ${notifyType})`);
    const result = await notifyBatch(session.batchId, notifyType, message, meta);
    
    console.log(`[ReminderWorker] Job ${job.id} completed successfully. Notified ${result?.count || 0} students.`);
  } catch (error) {
    console.error(`[ReminderWorker] Job ${job.id} failed:`, error.message);
    // Rethrow to trigger Bull retry mechanisms
    throw error;
  }
});

// Listen for job failure events to handle retries and admin alerts
reminderQueue.on('failed', async (job, err) => {
  const { sessionId, type } = job.data;
  console.error(`[ReminderWorker] Job ${job.id} failed (Attempt ${job.attemptsMade}/${job.opts.attempts}). Error: ${err.message}`);

  // Check if all retries are exhausted
  if (job.attemptsMade >= job.opts.attempts) {
    console.error(`[ReminderWorker] Job ${job.id} exhausted all 3 retries. Notifying system administrators...`);
    try {
      const message = `Critical Reminder Error: Reminder job ${job.id} of type "${type}" for session "${sessionId}" failed after 3 attempts. Last error: ${err.message}`;
      await notifyAdmins('code_review_error', message, {
        jobId: job.id,
        sessionId,
        type,
        error: err.message
      });
      console.log(`[ReminderWorker] Administrators notified of critical failure on job ${job.id}`);
    } catch (adminError) {
      console.error('[ReminderWorker] Failed to notify administrators of job failure:', adminError.message);
    }
  }
});

// Standalone execution support: allows running the worker directly in a separate process
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectRun) {
  console.log('[ReminderWorker] Running in standalone worker mode. Connecting to DB...');
  const DB_URI = process.env.DB_URI || 'mongodb://127.0.0.1:27017/ims';
  try {
    await connectDatabase(DB_URI);
    console.log('[ReminderWorker] Connected to database. Standing by for jobs...');
  } catch (error) {
    console.error('[ReminderWorker] Database connection failed:', error.message);
    process.exit(1);
  }
}
