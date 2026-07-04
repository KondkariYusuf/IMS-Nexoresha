/**
 * Stub implementation of the Notification Service for decoupling Module 2.
 * Real logic will be implemented in Module 3.
 */

export async function notifyBatch(batchId, type, message, meta = {}) {
  console.log(`[Notification STUB] notifyBatch called - batchId: ${batchId}, type: ${type}, message: "${message}", meta:`, meta);
  return { success: true, mocked: true };
}

export async function notifyAdmins(type, message, meta = {}) {
  console.log(`[Notification STUB] notifyAdmins called - type: ${type}, message: "${message}", meta:`, meta);
  return { success: true, mocked: true };
}

export async function scheduleReminder(sessionId, fireAt, type) {
  console.log(`[Notification STUB] scheduleReminder called - sessionId: ${sessionId}, fireAt: ${fireAt}, type: ${type}`);
  return { success: true, mocked: true, reminderId: 'mock-reminder-uuid' };
}

export async function createNotification(userId, type, message, meta = {}) {
  console.log(`[Notification STUB] createNotification called - userId: ${userId}, type: ${type}, message: "${message}", meta:`, meta);
  return { success: true, mocked: true };
}
