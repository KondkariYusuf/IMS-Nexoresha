import 'dotenv/config';
import mongoose from 'mongoose';
import { createClient } from 'redis';
import { connectDatabase } from '../config/database.js';
import { User, Role, Batch, Student, Notification, Session, Course, Assignment } from '../src/models/index.js';
import { createNotification, sendEmail, notifyBatch, notifyAdmins, scheduleReminder } from '../src/service/notificationService.js';
import { reminderQueue } from '../src/queues/reminderQueue.js';

// Setup environment override for test DB
const TEST_DB_URI = process.env.DB_URI || 'mongodb://127.0.0.1:27017/ims_test';

async function runTests() {
  console.log('=== STARTING NOTIFICATION SYSTEM QUEUE & WORKER TESTS ===');

  // 1. Connect to Database
  try {
    await connectDatabase(TEST_DB_URI);
    console.log('Connected to test DB successfully.');
  } catch (error) {
    console.error('Failed to connect to test database:', error);
    process.exit(1);
  }

  // Clear previous test records
  console.log('Cleaning existing test records...');
  await Promise.all([
    User.deleteMany({ email: /@test-notification\.com$/ }),
    Role.deleteMany({ name: { $in: ['admin', 'student'] } }),
    Batch.deleteMany({ name: /Test Batch/ }),
    Student.deleteMany({}),
    Notification.deleteMany({}),
    Session.deleteMany({ title: /Test Session/ }),
    Course.deleteMany({ name: /Test Course/ }),
    Assignment.deleteMany({}),
  ]);

  // Seed baseline data
  console.log('Seeding basic data (roles, users, batch)...');
  const adminRole = await Role.create({ name: 'admin', description: 'System Administrator' });
  const studentRole = await Role.create({ name: 'student', description: 'Student Role' });
  
  const adminUser = await User.create({
    email: 'admin1@test-notification.com',
    mobileNo: '1234567890',
    name: 'System Admin',
    password: 'password123',
    roleId: adminRole._id,
    profileStatus: 'Active',
  });

  const activeUser = await User.create({
    email: 'active-student@test-notification.com',
    mobileNo: '1234567891',
    name: 'Active Student',
    password: 'password123',
    roleId: studentRole._id,
    profileStatus: 'Active',
  });

  const testBatch = await Batch.create({
    name: 'Test Batch 2026',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: 'ongoing',
  });

  const studentActive = await Student.create({
    enrollementNo: 'ACT001',
    userId: activeUser._id,
    dob: new Date('2000-01-01'),
    batchId: testBatch._id,
  });

  const testCourse = await Course.create({
    name: 'Test Course',
    instructorIds: [],
  });

  const testSession = await Session.create({
    title: 'Test Session Title',
    notes: 'Session details',
    courseId: testCourse._id,
    batchId: testBatch._id,
    sessionDateAndTime: new Date(Date.now() + 60000), // Start in 1 minute
    duration: '1h',
    status: 'scheduled',
  });

  console.log('Seed completed successfully.');

  // Test 1: Validation Rules (Past Timestamp, Missing Session ID, Invalid Type, Session Not Found)
  console.log('\n--- Test 1: Validation Rules ---');

  // Case A: Missing sessionId
  try {
    await scheduleReminder('', new Date(Date.now() + 1000), 'lecture_reminder_24h');
    console.error('✗ Failure: Did not reject missing sessionId');
  } catch (err) {
    console.log('✓ Passed: Correctly rejected missing sessionId:', err.message);
  }

  // Case B: Invalid Type
  try {
    await scheduleReminder(testSession._id, new Date(Date.now() + 1000), 'invalid_reminder_type');
    console.error('✗ Failure: Did not reject invalid reminder type');
  } catch (err) {
    console.log('✓ Passed: Correctly rejected invalid reminder type:', err.message);
  }

  // Case C: Past Timestamp
  try {
    await scheduleReminder(testSession._id, new Date(Date.now() - 5000), 'lecture_reminder_24h');
    console.error('✗ Failure: Did not reject past timestamp');
  } catch (err) {
    console.log('✓ Passed: Correctly rejected past timestamp:', err.message);
  }

  // Case D: Session Not Found
  try {
    await scheduleReminder('non-existent-session-id', new Date(Date.now() + 10000), 'lecture_reminder_24h');
    console.error('✗ Failure: Did not reject non-existent session ID');
  } catch (err) {
    console.log('✓ Passed: Correctly rejected non-existent session ID:', err.message);
  }

  // Check Redis availability to run Bull Queue Test
let redisAvailable = true;

try {
  await reminderQueue.isReady();
  console.log('✓ Redis connection verified via Bull queue.');
} catch (err) {
  console.error('Redis verification failed:', err.message);
  redisAvailable = false;
}

  if (redisAvailable) {
    console.log('\n--- Test 2: scheduleReminder() Success Case & Worker processing ---');
    
    // We will import the worker script so the worker processor runs in this process
    await import('../src/workers/reminderWorker.js');

    // Schedule a reminder for 2 seconds in the future
    const fireTime = new Date(Date.now() + 2000);
    const metadata = await scheduleReminder(testSession._id, fireTime, 'lecture_reminder_24h');
    console.log('scheduleReminder returned metadata:', metadata);

    if (metadata.jobId && metadata.delay > 0) {
      console.log('✓ Passed: Returned job metadata successfully.');
    } else {
      console.error('✗ Failure: Metadata fields are incorrect.');
    }

    // Wait for worker to run and verify
    console.log('Waiting 5 seconds for worker to process the job...');
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Verify notification was created by worker
    const createdNotification = await Notification.findOne({ userId: activeUser._id, type: 'session_reminder' });
    if (createdNotification) {
      console.log('✓ Passed: Worker successfully processed job and sent notification:');
      console.log('   Notification:', createdNotification.message);
    } else {
      console.error('✗ Failure: Worker did not create notification.');
    }

    // Test 3: Session Cancelled/Completed check in Worker
    console.log('\n--- Test 3: Session Cancelled check in Worker ---');
    // Change session status to cancelled
    testSession.status = 'cancelled';
    await testSession.save();
    console.log('Updated session status to "cancelled"');

    // Schedule another reminder
    const fireTime2 = new Date(Date.now() + 2000);
    const metadata2 = await scheduleReminder(testSession._id, fireTime2, 'lecture_reminder_1h');
    console.log(`Scheduled reminder jobId: ${metadata2.jobId}`);

    // Wait and verify no new notification is created
    console.log('Waiting 4 seconds...');
    await new Promise((resolve) => setTimeout(resolve, 4000));

    const notificationCount = await Notification.countDocuments({ userId: activeUser._id, message: /starts in 1 hour/ });
    if (notificationCount === 0) {
      console.log('✓ Passed: Worker correctly skipped processing for cancelled session.');
    } else {
      console.error('✗ Failure: Worker sent notifications for a cancelled session!');
    }

  } else {
    console.log('⚠ Redis is not running. Skipping Bull queue and worker runtime integration tests.');
  }

  // Clean up and disconnect
  console.log('\nClosing Redis connections...');
  await reminderQueue.close();
  console.log('Disconnecting from DB...');
  await mongoose.disconnect();
  console.log('=== TESTING COMPLETE ===');
}

runTests();
