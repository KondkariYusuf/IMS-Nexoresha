import Queue from "bull";
import IORedis from "ioredis";

function createRedisClient() {
  return new IORedis(process.env.REDIS_URL, {
    tls: {},
    enableReadyCheck: false,
    maxRetriesPerRequest: null
  });
}

export const codeReviewQueue = new Queue(
  "code-review",
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
          const isTest =
            process.env.NODE_ENV === "test" ||
            process.env.FAST_RETRY === "true";

          const delays = isTest
            ? [100, 200, 300]
            : [60000, 300000, 900000];

          console.log("FAST_RETRY =", process.env.FAST_RETRY);
          console.log("isTest =", isTest);
          console.log("Retry delay =", delays[attemptsMade - 1] || delays[2]);

          return delays[attemptsMade - 1] || delays[2];
        }
      }
    }
  }
);