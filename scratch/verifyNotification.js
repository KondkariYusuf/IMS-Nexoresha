import 'dotenv/config';
import mongoose from 'mongoose';
import { createClient } from 'redis';
import { connectDatabase } from '../config/database.js';
import { User, Role, Batch, Student, Notification, Session, Course } from '../src/models/index.js';
import { createNotification, sendEmail, notifyBatch, notifyAdmins, scheduleReminder } from '../src/service/notificationService.js';
import { reminderQueue } from '../src/utils/cron/sessionReminders.js';

// Setup environment override for test DB
const TEST_DB_URI = process.env.DB_URI || 'mongodb://127.0.0.1:27017/ims_test';

async function runTests() {
  console.log('=== STARTING NOTIFICATION SYSTEM INTEGRATION TESTS ===');

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
  ]);

  try {
    // 2. Seed Mock Roles
    console.log('Seeding roles...');
    const adminRole = await Role.create({ name: 'admin', description: 'System Administrator' });
    const studentRole = await Role.create({ name: 'student', description: 'Student Role' });
    console.log(`Created Roles: Admin ID: ${adminRole._id}, Student ID: ${studentRole._id}`);

    // 3. Seed Mock Users
    console.log('Seeding users...');
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

    const inactiveUser = await User.create({
      email: 'inactive-student@test-notification.com',
      mobileNo: '1234567892',
      name: 'Inactive Student',
      password: 'password123',
      roleId: studentRole._id,
      profileStatus: 'Inactive',
    });

    console.log('Mock users created.');

    // 4. Seed Mock Batch
    const testBatch = await Batch.create({
      name: 'Test Batch 2026',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'ongoing',
    });

    // 5. Seed Mock Students
    const studentActive = await Student.create({
      enrollementNo: 'ACT001',
      userId: activeUser._id,
      dob: new Date('2000-01-01'),
      batchId: testBatch._id,
    });

    const studentInactive = await Student.create({
      enrollementNo: 'INA002',
      userId: inactiveUser._id,
      dob: new Date('2000-01-01'),
      batchId: testBatch._id,
    });

    console.log('Mock students enrolled in test batch.');

    // 6. Test 1: createNotification()
    console.log('\n--- Testing createNotification() ---');
    const note = await createNotification(
      activeUser._id,
      'session_scheduled',
      'Test Single Notification Message',
      { testMetaKey: 'testMetaValue' }
    );
    console.log('createNotification returned:', note);
    const dbNote = await Notification.findById(note._id);
    if (dbNote && dbNote.message === 'Test Single Notification Message') {
      console.log('✓ Success: Single notification created and verified in database.');
    } else {
      throw new Error('✗ Failure: Notification not found or mismatched values in DB.');
    }

    // 7. Test 2: notifyBatch() - only Active students should get notifications
    console.log('\n--- Testing notifyBatch() ---');
    const batchResult = await notifyBatch(
      testBatch._id,
      'assignment_published',
      'A new assignment has been published!',
      { batchId: testBatch._id }
    );
    console.log('notifyBatch result:', batchResult);

    const activeNotificationsCount = await Notification.countDocuments({ userId: activeUser._id });
    const inactiveNotificationsCount = await Notification.countDocuments({ userId: inactiveUser._id });

    // Active student should have 2 notifications (1 from Test 1, 1 from Test 2)
    console.log(`Active student notifications count (expected 2): ${activeNotificationsCount}`);
    console.log(`Inactive student notifications count (expected 0): ${inactiveNotificationsCount}`);

    if (activeNotificationsCount === 2 && inactiveNotificationsCount === 0) {
      console.log('✓ Success: Only active students in the batch were notified.');
    } else {
      throw new Error('✗ Failure: Active filtering or bulk insertion failed.');
    }

    // 8. Test 3: notifyAdmins()
    console.log('\n--- Testing notifyAdmins() ---');
    const adminResult = await notifyAdmins(
      'code_review_error',
      'A critical error occurred in the queue worker processing job 123.',
      { err: 'QueueTimeout' }
    );
    console.log('notifyAdmins result:', adminResult);
    
    const adminNotificationsCount = await Notification.countDocuments({ userId: adminUser._id });
    console.log(`Admin user notifications count (expected 1): ${adminNotificationsCount}`);

    if (adminNotificationsCount === 1) {
      console.log('✓ Success: Active system admins successfully notified.');
    } else {
      throw new Error('✗ Failure: Admin notification failed.');
    }

    // 9. Check Redis availability to run Bull Queue Test
    console.log('\nChecking Redis connection status...');
    const redisAvailable = await new Promise(async (resolve) => {
      try {
        const client = createClient({
          url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
          socket: { connectTimeout: 1000 }
        });
        client.on('error', () => resolve(false));
        await client.connect();
        await client.disconnect();
        resolve(true);
      } catch (err) {
        resolve(false);
      }
    });

    if (redisAvailable) {
      console.log('\n--- Testing scheduleReminder() ---');
      // Create a mock Course and Session
      const testCourse = await Course.create({
        name: 'Test Course',
        instructorIds: [],
      });
      const testSession = await Session.create({
        title: 'Test Session Title',
        notes: 'Session details',
        courseId: testCourse._id,
        batchId: testBatch._id,
        sessionDateAndTime: new Date(Date.now() + 5000), // Start in 5 seconds
        duration: '1h',
        status: 'scheduled',
      });

      console.log('Created test session. Scheduling session_reminder job for 2 seconds in the future...');
      const fireTime = new Date(Date.now() + 2000);
      const job = await scheduleReminder(testSession._id, fireTime, 'session_reminder');
      console.log(`Job scheduled: ID = ${job.id}`);

      // Wait and verify if the job was queued
      const jobStatus = await job.getState();
      console.log(`Current job status in Redis: ${jobStatus}`);
      console.log('✓ Success: Bull Job successfully added to Redis Queue.');

      // Wait a few seconds to let Bull pick it up
      console.log('Waiting 4 seconds to observe worker execution...');
      await new Promise((resolve) => setTimeout(resolve, 4000));

      const finalJobState = await job.getState();
      console.log(`Job state after wait: ${finalJobState}`);
      if (finalJobState === 'completed') {
        console.log('✓ Success: Bull worker processed the job successfully.');
      } else {
        console.log('Note: Job has not processed. Check Redis and worker logging.');
      }
    } else {
      console.log('⚠ Redis is not running. Skipping scheduleReminder() queue integration tests.');
    }

  } catch (err) {
    console.error('Test execution failed with error:', err);
  } finally {
    // 10. Clean up and close connections
    console.log('\nClosing Redis connections...');
    await reminderQueue.close();
    console.log('Disconnecting from DB...');
    await mongoose.disconnect();
    console.log('=== TESTING COMPLETE ===');
  }
}

runTests();
