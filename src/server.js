import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from '../config/database.js';
import './workers/reminderWorker.js';
import './workers/codeReviewWorker.js';

import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);

const port = Number(process.env.PORT || 4000);
const dbUri = process.env.DB_URI || process.env.MONGO_URI;

async function startServer(currentPort = port) {
  await connectDatabase(dbUri);

  const server = app.listen(currentPort, () => {
    console.log(`Server running on port ${currentPort}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.warn(`Port ${currentPort} is busy. Trying ${currentPort + 1}...`);
      server.close(() => startServer(currentPort + 1));
    } else {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});