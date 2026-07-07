import 'dotenv/config';
import mongoose from 'mongoose';
import { Assignment, Batch, Student } from './src/models/index.js';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);

async function seedAssignment() {
  try {
    const dbUri = process.env.DB_URI;
    if (!dbUri) throw new Error('DB_URI not found in .env');

    mongoose.set('strictQuery', true);
    await mongoose.connect(dbUri);
    console.log('✅ Connected to MongoDB');

    const student = await Student.findOne({ enrollementNo: 'TEST-STU-001' });
    if (!student) {
      console.error('❌ Student not found! Please run setup-test-student.js first.');
      process.exit(1);
    }

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Create a mock Assignment document
    const assignment = await Assignment.create({
      title: 'First Coding Assignment',
      prompt: 'Build a REST API.',
      task: 'Create the endpoints specified in the readme.',
      instructions: 'Submit your github URL.',
      attachments: 'none',
      submissionDeadline: nextWeek,
      status: 'published',
      createdBy: new mongoose.Types.ObjectId(), // mock instructor ID
    });

    console.log('✅ Created test assignment!');
    console.log(`Assignment ID: ${assignment._id}`);
    console.log(`Use this Assignment ID in your Postman POST request!`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected');
    process.exit(0);
  }
}

seedAssignment();
