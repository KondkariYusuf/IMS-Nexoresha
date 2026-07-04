process.env.FAST_RETRY = "true";
process.env.NODE_ENV = 'test';

import 'dotenv/config';
import mongoose from 'mongoose';
import { createClient } from 'redis';
import { connectDatabase } from '../config/database.js';
import { User, Role, Batch, Student, Notification, Session, Course, Assignment, AssignmentSubmission, AssignmentResult, StudentLedger } from '../src/models/index.js';
import { queueReview } from '../src/service/codeReviewService.js';
import { codeReviewQueue } from '../src/queues/codeReviewQueue.js';
import '../src/workers/codeReviewWorker.js';

const TEST_DB_URI = process.env.DB_URI || 'mongodb://127.0.0.1:27017/ims_test';

async function runTests() {
  console.log('=== STARTING CODE REVIEW BACKEND QUEUE & WORKER TESTS ===');
  // Add a small delay so Bull listeners fully register
  await new Promise(resolve => setTimeout(resolve, 1000));

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
    User.deleteMany({ email: /@test-codereview\.com$/ }),
    Role.deleteMany({ name: { $in: ['admin', 'student', 'instructor'] } }),
    Batch.deleteMany({ name: /Test Batch/ }),
    Student.deleteMany({ enrollementNo: /CR-/ }),
    Notification.deleteMany({ message: /code review/i }),
    Session.deleteMany({ title: /Test Session/ }),
    Course.deleteMany({ name: /Test Course/ }),
    Assignment.deleteMany({ title: /Test Assignment/ }),
    AssignmentSubmission.deleteMany({ gitSubmissionLink: /github\.com/ }),
    AssignmentResult.deleteMany({}),
    StudentLedger.deleteMany({ description: /assignment submission/i }),
  ]);

  // Seed baseline data
  console.log('Seeding basic data (roles, users, batch, student, course, session, assignment)...');
  
  const adminRole = await Role.create({ name: 'admin', description: 'System Administrator' });
  const studentRole = await Role.create({ name: 'student', description: 'Student Role' });
  
  const adminUser = await User.create({
    email: 'admin1@test-codereview.com',
    mobileNo: '9999999990',
    name: 'System Admin 1',
    password: 'password123',
    roleId: adminRole._id,
    profileStatus: 'Active',
  });

  // Create 3 more admins to make it exactly 4 system admins as per business rules
  await User.create([
    {
      email: 'admin2@test-codereview.com',
      mobileNo: '9999999991',
      name: 'System Admin 2',
      password: 'password123',
      roleId: adminRole._id,
      profileStatus: 'Active',
    },
    {
      email: 'admin3@test-codereview.com',
      mobileNo: '9999999992',
      name: 'System Admin 3',
      password: 'password123',
      roleId: adminRole._id,
      profileStatus: 'Active',
    },
    {
      email: 'admin4@test-codereview.com',
      mobileNo: '9999999993',
      name: 'System Admin 4',
      password: 'password123',
      roleId: adminRole._id,
      profileStatus: 'Active',
    }
  ]);

  const activeStudentUser = await User.create({
    email: 'student@test-codereview.com',
    mobileNo: '8888888888',
    name: 'Test Student',
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

  const testStudent = await Student.create({
    enrollementNo: 'CR-STUD-001',
    userId: activeStudentUser._id,
    dob: new Date('2001-01-01'),
    batchId: testBatch._id,
    totalPoints: 0
  });

  const testCourse = await Course.create({
    name: 'Test Course',
    instructorIds: [],
  });

  const testSession = await Session.create({
    title: 'Test Session',
    notes: 'Code review queue testing session',
    courseId: testCourse._id,
    batchId: testBatch._id,
    sessionDateAndTime: new Date(),
    duration: '2h',
    status: 'completed',
  });

  const testAssignment = await Assignment.create({
    title: 'Test Assignment 1',
    sessionId: testSession._id,
    prompt: 'Implement a linked list in C++',
    submissionDeadline: new Date(Date.now() + 3600000), // 1 hour from now (On Time)
    attachments: 'instructions.pdf',
    instructions: 'Follow guidelines',
    task: 'Linked list implementation',
  });

  // On Time Submission
  const onTimeSubmission = await AssignmentSubmission.create({
    studentId: testStudent._id,
    assignmentId: testAssignment._id,
    gitSubmissionLink: 'https://github.com/test-owner/test-repo',
    repoName: 'test-repo',
    branchName: 'main',
    remarks: 'Finished initial draft',
    submittedAt: new Date(),
    onTimeSubmission: true,
  });

  // Late Submission
  const lateSubmission = await AssignmentSubmission.create({
    studentId: testStudent._id,
    assignmentId: testAssignment._id,
    gitSubmissionLink: 'https://github.com/test-owner/test-repo-late',
    repoName: 'test-repo-late',
    branchName: 'main',
    remarks: 'Sorry for late submission',
    submittedAt: new Date(Date.now() + 7200000), // 2 hours from now (Late)
    onTimeSubmission: false,
  });

  console.log('Seed completed successfully.\n');

  // Test 1: Validation Rules (Reject if submissionId missing, not found, or invalid URL)
  console.log('--- Test 1: Validation Rules ---');
  
  // Case A: Missing submissionId
  try {
    await queueReview('');
    console.error('✗ Failure: Did not reject missing submissionId');
  } catch (err) {
    console.log('✓ Passed: Correctly rejected missing submissionId:', err.message);
  }

  // Case B: Submission Not Found
  try {
    await queueReview(new mongoose.Types.ObjectId().toString());
    console.error('✗ Failure: Did not reject non-existent submission');
  } catch (err) {
    console.log('✓ Passed: Correctly rejected non-existent submission:', err.message);
  }

  // Case C: Invalid GitHub URL
  const invalidUrlSubmission = await AssignmentSubmission.create({
    studentId: testStudent._id,
    assignmentId: testAssignment._id,
    gitSubmissionLink: 'https://not-github.com/test-owner/test-repo',
    repoName: 'test-repo',
    branchName: 'main',
    remarks: 'Invalid link',
    submittedAt: new Date(),
    onTimeSubmission: true,
  });
  try {
    await queueReview(invalidUrlSubmission._id);
    console.error('✗ Failure: Did not reject invalid GitHub URL');
  } catch (err) {
    console.log('✓ Passed: Correctly rejected invalid GitHub URL:', err.message);
  }

  // Check Redis availability to run Bull Queue Test
 let redisAvailable = true;

try {
  await codeReviewQueue.isReady();
  console.log('✓ Redis connection verified via Bull queue.');
} catch (err) {
  console.error('Redis verification failed:', err.message);
  redisAvailable = false;
}

  if (redisAvailable) {
    console.log('Redis is running. Setting up worker and starting queue tests...');
    
    // Clean the queue completely to avoid stale jobs interference
    await codeReviewQueue.empty();
    await codeReviewQueue.clean(0, 'completed');
    await codeReviewQueue.clean(0, 'wait');
    await codeReviewQueue.clean(0, 'active');
    await codeReviewQueue.clean(0, 'delayed');
    await codeReviewQueue.clean(0, 'failed');
    console.log("CodeReviewQueue cleaned");

    const cleanCounts = await codeReviewQueue.getJobCounts();
    console.log("QUEUE COUNTS AFTER CLEAN:", cleanCounts);

    // Worker is statically imported at the top to avoid registration race conditions

    // Test 2: Success Case (On-Time Submission)
    console.log('\n--- Test 2: Success Case (On-Time Submission) ---');
    console.log('Queueing review for on-time submission...');
    const job = await queueReview(onTimeSubmission._id);
    console.log(`Job queued successfully. ID: ${job.id}`);

    // Wait for the worker to process the job
    console.log('Waiting 3 seconds for worker to process job...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Verify submission is updated
    const updatedOnTimeSubmission = await AssignmentSubmission.findById(onTimeSubmission._id);
    console.log(`Updated submission review status: ${updatedOnTimeSubmission.reviewStatus}`);
    if (updatedOnTimeSubmission.reviewStatus === 'completed') {
      console.log('✓ Passed: reviewStatus set to "completed"');
    } else {
      console.error('✗ Failure: reviewStatus is not "completed"');
    }

    if (updatedOnTimeSubmission.ledgerEventId) {
      console.log('✓ Passed: ledgerEventId is linked');
    } else {
      console.error('✗ Failure: ledgerEventId is missing');
    }

    // Verify AssignmentResult is created
    const onTimeResult = await AssignmentResult.findOne({ submissionId: onTimeSubmission._id });
    if (onTimeResult) {
      console.log(`✓ Passed: AssignmentResult found. Marks: ${onTimeResult.marksObtained}/10, Points: ${onTimeResult.points}, Total Points: ${onTimeResult.totalPoints}, Result: ${onTimeResult.result}`);
      if (onTimeResult.points === onTimeResult.marksObtained) {
        console.log('   ✓ Passed: Points matches marks obtained for on-time submission.');
      } else {
        console.error('   ✗ Failure: Points does not match marks obtained.');
      }
    } else {
      console.error('✗ Failure: AssignmentResult not found');
    }

    // Verify StudentLedger entry is created
    if (updatedOnTimeSubmission.ledgerEventId) {
      const ledgerEntry = await StudentLedger.findById(updatedOnTimeSubmission.ledgerEventId);
      if (ledgerEntry) {
        console.log(`✓ Passed: StudentLedger entry found. Points: ${ledgerEntry.points}, SourceType: ${ledgerEntry.sourceType}`);
      } else {
        console.error('✗ Failure: StudentLedger entry not found');
      }
    }

    // Verify Student's totalPoints is incremented
    const updatedStudent = await Student.findById(testStudent._id);
    console.log(`Updated student total points: ${updatedStudent.totalPoints}`);
    if (updatedStudent.totalPoints > 0) {
      console.log('✓ Passed: Student total points incremented.');
    } else {
      console.error('✗ Failure: Student total points not incremented.');
    }


    // Test 3: Late Submission (Points should be 0)
    console.log('\n--- Test 3: Late Submission ---');
    console.log('Queueing review for late submission...');
    const jobLate = await queueReview(lateSubmission._id);
    console.log(`Job queued successfully. ID: ${jobLate.id}`);

    console.log('Waiting 3 seconds for worker...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Verify AssignmentResult is created with 0 points
    const lateResult = await AssignmentResult.findOne({ submissionId: lateSubmission._id });
    if (lateResult) {
      console.log(`✓ Passed: AssignmentResult found for late submission. Marks: ${lateResult.marksObtained}/10, Points: ${lateResult.points}, Total Points: ${lateResult.totalPoints}, Result: ${lateResult.result}`);
      if (lateResult.points === 0) {
        console.log('   ✓ Passed: Points correctly set to 0 for late submission.');
      } else {
        console.error('   ✗ Failure: Points not set to 0 for late submission.');
      }
    } else {
      console.error('✗ Failure: AssignmentResult for late submission not found.');
    }


    // Test 4: Retry Logic & Exhaustion Failure Case
    console.log('\n--- Test 4: Retry Logic & Final Exhaustion (Failure Case) ---');
    
    // Create a submission that will cause API call to fail
    const failingSubmission = await AssignmentSubmission.create({
      studentId: testStudent._id,
      assignmentId: testAssignment._id,
      gitSubmissionLink: 'https://github.com/fail-owner/fail-repo',
      repoName: 'fail-repo',
      branchName: 'main',
      remarks: 'Failing review test',
      submittedAt: new Date(),
      onTimeSubmission: true,
    });

    // To simulate API failures, we will configure a failing mock URL/behavior
    // Let's set CODE_REVIEW_API_URL to a non-existent port to force immediate ECONNREFUSED failures
    process.env.CODE_REVIEW_API_URL = 'http://127.0.0.1:65499/code-review';
    console.log('Configured process.env.CODE_REVIEW_API_URL to force failures:', process.env.CODE_REVIEW_API_URL);

    console.log('Queueing review for failing submission...');
    const failJob = await queueReview(failingSubmission._id);
    console.log(`Job queued. ID: ${failJob.id}`);
    const counts = await codeReviewQueue.getJobCounts();
    console.log('QUEUE COUNTS:', counts);

    // Wait enough time for all 3 attempts (attempt 1, delay 100ms, attempt 2, delay 200ms, attempt 3)
    // 5 seconds should be more than enough for retries since we mock/force fast retries in test env
console.log('Waiting 10 seconds for worker retries and exhaustion...');
await new Promise((resolve) => setTimeout(resolve, 10000));

    // Verify submission status is set to error
    const updatedFailingSubmission = await AssignmentSubmission.findById(failingSubmission._id);
    console.log(`Failing submission reviewStatus: ${updatedFailingSubmission.reviewStatus}`);
    if (updatedFailingSubmission.reviewStatus === 'error') {
      console.log('✓ Passed: reviewStatus successfully updated to "error" after exhaustion.');
    } else {
      console.error('✗ Failure: reviewStatus is not "error". Current status:', updatedFailingSubmission.reviewStatus);
    }

    // Verify admin notifications are sent
    const adminNotificationCount = await Notification.countDocuments({
      type: 'code_review_error',
      message: new RegExp(failingSubmission._id)
    });
    console.log(`Admin error notifications count: ${adminNotificationCount}`);
    if (adminNotificationCount > 0) {
      console.log('✓ Passed: Admins were notified of the critical code review failure.');
    } else {
      console.error('✗ Failure: Admin notifications were not sent.');
    }

  } else {
    console.log('⚠ Redis is not running. Skipping Bull queue and worker runtime integration tests.');
  }

  // Clean up and disconnect
  console.log('\nClosing Redis connections...');
  await codeReviewQueue.close();
  console.log('Disconnecting from DB...');
  await mongoose.disconnect();
  console.log('=== CODE REVIEW QUEUE TESTING COMPLETE ===');
}

runTests();
