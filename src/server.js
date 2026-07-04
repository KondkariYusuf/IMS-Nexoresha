import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from '../config/database.js';
import './workers/reminderWorker.js';
import './workers/codeReviewWorker.js';

import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4'])

const port = process.env.PORT || 4000;

async function startServer() {
  await connectDatabase(process.env.DB_URI);

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});