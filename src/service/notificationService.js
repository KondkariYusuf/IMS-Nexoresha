import nodemailer from 'nodemailer';
import { User, Role, Student, Notification } from '../models/index.js';
import { reminderQueue } from '../utils/cron/sessionReminders.js';

let transporter = null;

// Lazily initialize SMTP transporter from .env configuration
function getTransporter() {
  if (!transporter) {
    const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;
    if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
      console.warn('[NotificationService] SMTP environment variables are missing. Emails will not be sent.');
      return null;
    }
    transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: parseInt(EMAIL_PORT, 10) || 587,
      secure: parseInt(EMAIL_PORT, 10) === 465,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });
  }
  return transporter;
}

/**
 * Saves a notification to the database for a specific user.
 */
export async function createNotification(userId, type, message, meta = {}) {
  if (!userId || !type || !message) {
    throw new Error('Invalid input: userId, type, and message are required.');
  }

  try {
    const notification = new Notification({
      userId,
      type,
      message,
      meta,
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error(`[NotificationService] Error creating notification for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Sends a transactional email using the SMTP provider configured in .env.
 */
export async function sendEmail(to, subject, html) {
  if (!to || !subject || !html) {
    return { success: false, error: 'Missing recipient, subject, or HTML body.' };
  }

  const client = getTransporter();
  if (!client) {
    console.warn(`[NotificationService] Skipping email to ${to} (transporter not initialized).`);
    return { success: false, error: 'Transporter not configured.' };
  }

  try {
    const info = await client.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[NotificationService] Error sending email to ${to}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Sends an in-app notification and email to all active students in a batch.
 */
export async function notifyBatch(batchId, type, message, meta = {}) {
  if (!batchId || !type || !message) {
    throw new Error('Invalid input: batchId, type, and message are required.');
  }

  try {
    // 1. Fetch students of this batch and populate User detail
    const students = await Student.find({ batchId }).populate('userId');
    
    // Filter for Active students only
    const activeStudents = students.filter(
      (student) => student.userId && student.userId.profileStatus === 'Active'
    );

    if (activeStudents.length === 0) {
      console.log(`[NotificationService] No active students found for batch: ${batchId}`);
      return { success: true, count: 0 };
    }

    // 2. Bulk insert in-app notifications to avoid N+1 database queries
    const notificationsToInsert = activeStudents.map((student) => ({
      userId: student.userId._id,
      type,
      message,
      meta,
    }));
    await Notification.insertMany(notificationsToInsert);

    // 3. Send email notifications asynchronously
    const emailPromises = activeStudents.map((student) => {
      if (student.userId.email) {
        return sendEmail(
          student.userId.email,
          `[IMS] Notification: ${type.replace(/_/g, ' ').toUpperCase()}`,
          `<p>${message}</p>`
        );
      }
      return Promise.resolve(null);
    });
    await Promise.all(emailPromises);

    return { success: true, count: activeStudents.length };
  } catch (error) {
    console.error(`[NotificationService] Error notifying batch ${batchId}:`, error);
    throw error;
  }
}

/**
 * Sends an in-app notification and email to all system admins.
 */
export async function notifyAdmins(type, message, meta = {}) {
  if (!type || !message) {
    throw new Error('Invalid input: type and message are required.');
  }

  try {
    // 1. Fetch admin role
    const adminRole = await Role.findOne({ name: { $regex: /^admin$/i } });
    let admins = [];
    if (adminRole) {
      admins = await User.find({ roleId: adminRole._id });
    } else {
      // Fallback: Populate roleId and search
      const allUsers = await User.find().populate('roleId');
      admins = allUsers.filter(
        (u) => u.roleId && u.roleId.name && u.roleId.name.toLowerCase() === 'admin'
      );
    }

    // Ensure we only notify active admins
    const activeAdmins = admins.filter((admin) => admin.profileStatus === 'Active');

    if (activeAdmins.length === 0) {
      console.warn('[NotificationService] No active admins found to notify.');
      return { success: true, count: 0 };
    }

    // 2. Bulk insert in-app notifications
    const notificationsToInsert = activeAdmins.map((admin) => ({
      userId: admin._id,
      type,
      message,
      meta,
    }));
    await Notification.insertMany(notificationsToInsert);

    // 3. Send email alerts to each admin
    const emailPromises = activeAdmins.map((admin) => {
      if (admin.email) {
        return sendEmail(
          admin.email,
          `[IMS ADMIN ALERT] ${type.replace(/_/g, ' ').toUpperCase()}`,
          `<p><strong>Critical Admin Notification:</strong></p><p>${message}</p>`
        );
      }
      return Promise.resolve(null);
    });
    await Promise.all(emailPromises);

    return { success: true, count: activeAdmins.length };
  } catch (error) {
    console.error(`[NotificationService] Error notifying admins:`, error);
    throw error;
  }
}

/**
 * Schedules a delayed Bull job to trigger a notification at a specific time.
 */
export async function scheduleReminder(sessionId, fireAt, type) {
  if (!sessionId || !fireAt || !type) {
    throw new Error('Invalid input: sessionId, fireAt, and type are required.');
  }

  try {
    const fireTime = new Date(fireAt).getTime();
    const delay = fireTime - Date.now();

    // Setup delayed job options
    const jobOptions = {
      delay: Math.max(0, delay),
      jobId: `${sessionId}-${type}-${fireTime}`, // Prevent scheduling duplicates
      removeOnComplete: true,
      removeOnFail: false,
    };

    const job = await reminderQueue.add(
      {
        sessionId,
        type,
        fireAt,
      },
      jobOptions
    );

    console.log(`[NotificationService] Scheduled delayed job: ${job.id} for session: ${sessionId} (delay: ${jobOptions.delay}ms)`);
    return job;
  } catch (error) {
    console.error(`[NotificationService] Error scheduling reminder for session ${sessionId}:`, error);
    throw error;
  }
}
