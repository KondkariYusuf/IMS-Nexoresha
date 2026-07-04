import Queue from 'bull';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

console.log(`[ReminderQueue] Initializing queue with Redis URL: ${REDIS_URL}`);

// Initialize the reminders queue with a custom backoff strategy
export const reminderQueue = new Queue('notification-reminders', REDIS_URL, {
  settings: {
    backoffStrategies: {
      customBackoff(attemptsMade, err) {
        // Attempts are 1-based (i.e. attempt 1 is the first retry)
        // Delay sequence: 1 min, 5 min, 15 min
        const delays = [60000, 300000, 900000];
        const delay = delays[attemptsMade - 1] || 900000;
        console.log(`[ReminderQueue] Custom backoff strategy invoked. Attempt: ${attemptsMade}, error: ${err?.message || 'unknown'}. Next retry in ${delay}ms`);
        return delay;
      }
    }
  }
});

// Gracefully handle Redis connection errors without crashing the parent process
reminderQueue.on('error', (err) => {
  console.error('[ReminderQueue] Redis connection error event:', err.message);
});
