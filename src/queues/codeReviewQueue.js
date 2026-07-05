import Queue from "bull";
import IORedis from "ioredis";

function createRedisClient() {
  const redisUrl = process.env.REDIS_URL || "";
  const isRemote = redisUrl.startsWith("rediss://") || redisUrl.includes("upstash.io");

  const redisOptions = {
    enableReadyCheck: false,
    maxRetriesPerRequest: null
  };

  if (isRemote) {
    redisOptions.tls = {};
  }

  return new IORedis(redisUrl, redisOptions);
}

export const codeReviewQueue = new Queue(
  process.env.NODE_ENV === "test"
    ? (process.env.TEST_QUEUE_NAME || "code-review-test")
    : "code-review",
  {
    createClient(type) {
      return createRedisClient();
    },

    settings: {
      backoffStrategies: {
        customBackoff(attemptsMade) {
          const isTest =
            process.env.NODE_ENV === "test" ||
            process.env.FAST_RETRY === "true";

          const delays = isTest
            ? [100, 200, 300]
            : [60000, 300000, 900000];

          return delays[attemptsMade - 1] || delays[2];
        }
      }
    }
  }
);