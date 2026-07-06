import Redis from 'redis';
import { CONSTANTS } from '../../utils/constant.js';

const client = Redis.createClient({ url: process.env.REDIS_URL || 'redis://127.0.0.1:6379' });
let clientReady = false;

client.on('error', (error) => {
  console.error('Redis Client Error', error);
});

async function connectRedis() {
  if (!clientReady) {
    try {
      await client.connect();
      clientReady = true;
    } catch (error) {
      clientReady = false;
      console.error('Redis connection failed:', error.message);
    }
  }
}

function createCacheKey(batchId, studentId) {
  return `metrics:batch:${batchId}:student:${studentId}`;
}

async function getStudentMetricsCache(batchId, studentId) {
  await connectRedis();
  if (!clientReady) {
    return null;
  }

  const key = createCacheKey(batchId, studentId);
  const raw = await client.get(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

async function setStudentMetricsCache(batchId, studentId, data) {
  await connectRedis();
  if (!clientReady) {
    return;
  }

  const key = createCacheKey(batchId, studentId);
  await client.set(key, JSON.stringify(data), {
    EX: CONSTANTS.METRIC_CACHE_TTL,
  });
}

async function invalidateBatchCache(batchId) {
  await connectRedis();
  if (!clientReady) {
    return;
  }

  const pattern = `metrics:batch:${batchId}:student:*`;
  const keys = await client.keys(pattern);
  if (keys.length) {
    await client.del(keys);
  }
}

export {
  getStudentMetricsCache,
  setStudentMetricsCache,
  invalidateBatchCache,
  connectRedis,
};
