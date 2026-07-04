import Queue from 'bull';
import { Session, Student, Assignment, AssignmentSubmission, Notification } from '../../models/index.js';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Initialize the reminders queue
export const reminderQueue = new Queue('notification-reminders', REDIS_URL);

// Worker processor for notification-reminders
reminderQueue.process(async (job) => {
  const { sessionId, type, fireAt } = job.data;
  console.log(`[Bull Worker] Processing job ${job.id} for type: ${type}, session: ${sessionId}`);

  // Lazily import service functions to avoid ES module circular dependency issues
  const { notifyBatch, sendEmail } = await import('../../service/notificationService.js');

  try {
    if (type === 'session_reminder') {
      const session = await Session.findById(sessionId);
      if (!session) {
        console.warn(`[Bull Worker] Session ${sessionId} not found. Skipping reminder.`);
        return;
      }

      // Check session status. Skip reminder if cancelled or completed
      if (session.status === 'cancelled' || session.status === 'completed') {
        console.log(`[Bull Worker] Session ${sessionId} status is ${session.status}. Skipping reminder.`);
        return;
      }

      const sessionDateStr = session.sessionDateAndTime ? new Date(session.sessionDateAndTime).toLocaleString() : 'N/A';
      const message = `Reminder: The session "${session.title}" is scheduled to start at ${sessionDateStr}.`;
      
      await notifyBatch(session.batchId, 'session_reminder', message, { sessionId });
      console.log(`[Bull Worker] Successfully sent session reminder for session: ${sessionId}`);

    } else if (type === 'assignment_approaching') {
      const session = await Session.findById(sessionId);
      if (!session) {
        console.warn(`[Bull Worker] Session ${sessionId} not found for assignment. Skipping reminder.`);
        return;
      }

      const assignment = await Assignment.findOne({ sessionId });
      if (!assignment) {
        console.warn(`[Bull Worker] No assignment found for session ${sessionId}. Skipping reminder.`);
        return;
      }

      // Fetch all students in the batch
      const students = await Student.find({ batchId: session.batchId }).populate('userId');
      const activeStudents = students.filter(s => s.userId && s.userId.profileStatus === 'Active');

      // Fetch all submissions for this assignment
      const submissions = await AssignmentSubmission.find({ assignmentId: assignment._id });
      const submittedStudentIds = new Set(submissions.map(s => s.studentId));

      // Filter students who haven't submitted yet
      const pendingStudents = activeStudents.filter(student => !submittedStudentIds.has(student._id));
      if (pendingStudents.length === 0) {
        console.log(`[Bull Worker] All students have already submitted assignment ${assignment._id}. Skipping reminder.`);
        return;
      }

      console.log(`[Bull Worker] Sending assignment_approaching reminders to ${pendingStudents.length} students.`);

      // Bulk database write for in-app notifications (Avoid N+1 queries)
      const notificationsToInsert = pendingStudents.map(student => ({
        userId: student.userId._id,
        type: 'assignment_approaching',
        message: `Reminder: The assignment "${assignment.title}" is approaching its submission deadline (due: ${new Date(assignment.submissionDeadline).toLocaleString()}).`,
        meta: { assignmentId: assignment._id, sessionId },
      }));
      await Notification.insertMany(notificationsToInsert);

      // Send emails to the pending students
      const emailPromises = pendingStudents.map(student => {
        if (student.userId && student.userId.email) {
          return sendEmail(
            student.userId.email,
            `[IMS] Assignment Deadline Approaching: ${assignment.title}`,
            `<p>Hi ${student.userId.name},</p>
             <p>This is a reminder that your assignment <strong>${assignment.title}</strong> is due within 24 hours.</p>
             <p>Please make sure to push your work and submit the repository link on the portal before the deadline.</p>`
          );
        }
        return Promise.resolve(null);
      });
      await Promise.all(emailPromises);

      console.log(`[Bull Worker] Sent assignment_approaching reminders successfully.`);
    } else {
      console.warn(`[Bull Worker] Unknown job type: ${type}`);
    }
  } catch (error) {
    console.error(`[Bull Worker] Error processing job ${job.id}:`, error);
    throw error;
  }
});
