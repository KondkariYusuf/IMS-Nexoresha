import mongoose from 'mongoose';

export function resolveDatabaseUri() {
  return process.env.DB_URI || process.env.MONGO_URL || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ims-nexoresha';
}

export async function connectDatabase(uri = resolveDatabaseUri()) {
  if (!uri) {
    throw new Error('DB_URI or MONGO_URL is required');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}