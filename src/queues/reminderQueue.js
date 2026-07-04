import Queue from "bull";
import IORedis from "ioredis";

function createRedisClient() {
  return new IORedis(process.env.REDIS_URL, {
    tls: {},
    enableReadyCheck: false,
    maxRetriesPerRequest: null
  });
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