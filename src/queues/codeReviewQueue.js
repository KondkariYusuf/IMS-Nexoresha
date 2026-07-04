import Queue from 'bull';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

console.log(`[CodeReviewQueue] Initializing queue with Redis URL: ${REDIS_URL}`);

// Initialize the code-review queue with a custom backoff strategy
export const codeReviewQueue = new Queue('code-review', REDIS_URL, {
  settings: {
    backoffStrategies: {
      customBackoff(attemptsMade, err) {
        // Attempts are 1-based (i.e. attempt 1 is the first retry)
        // Delay sequence: 1 min, 5 min, 15 min. In test environment, use short delays (100ms, 200ms, 300ms)
        const isTest = process.env.NODE_ENV === 'test';
        const delays = isTest ? [100, 200, 300] : [60000, 300000, 900000];
        const delay = delays[attemptsMade - 1] || (isTest ? 300 : 900000);
        console.log(`[CodeReviewQueue] Custom backoff strategy invoked. Attempt: ${attemptsMade}, error: ${err?.message || 'unknown'}. Next retry in ${delay}ms`);
        return delay;
      }
    }
  }
});

// Gracefully handle Redis connection errors without crashing the parent process
codeReviewQueue.on('error', (err) => {
  console.error('[CodeReviewQueue] Redis connection error event:', err.message);
});
