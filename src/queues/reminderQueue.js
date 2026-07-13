import Queue from "bull";
import IORedis from "ioredis";

function createRedisClient() {
  const redisUrl = process.env.REDIS_URL || "";
  const isRemote = redisUrl.startsWith("rediss://") || redisUrl.includes("upstash.io");

  const redisOptions = {
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
    retryStrategy(times) {
      if (times === 1) {
        console.error('[reminderQueue] Redis connection failed. Retrying in background...');
      }
      return 10000; // retry every 10 seconds silently
    }
  };

  if (isRemote) {
    redisOptions.tls = {};
  }

  return new IORedis(redisUrl, redisOptions);
}

export const reminderQueue = new Queue(
  "notification-reminders",
  {
    createClient(type) {
      switch (type) {
        case "client":
          return createRedisClient();

        case "subscriber":
          return createRedisClient();

        case "bclient":
          return createRedisClient();

        default:
          return createRedisClient();
      }
    },

    settings: {
      backoffStrategies: {
        customBackoff(attemptsMade) {
          const delays = [60000, 300000, 900000];
          return delays[attemptsMade - 1] || 900000;
        }
      }
    }
  }
);