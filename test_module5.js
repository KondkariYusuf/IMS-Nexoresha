import 'dotenv/config';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import * as service from './src/service/profileService.js';
import { User, Instructor, Student, Batch, Course, Topic, Session, Attendance, Quiz, QuizResult, Assignment, AssignmentSubmission, AssignmentResult, StudentLedger } from './src/models/index.js';

async function runTests() {
  console.log('Connecting to test database:', process.env.DB_URI);
  await connectDatabase(process.env.DB_URI);

  console.log('Clearing test data for clean slate...');
  await User.deleteMany({});
  await Instructor.deleteMany({});
  await Student.deleteMany({});
  await Batch.deleteMany({});
  await Course.deleteMany({});
  await Topic.deleteMany({});
  await Session.deleteMany({});
  await Attendance.deleteMany({});
  await Quiz.deleteMany({});
  await QuizResult.deleteMany({});
  await Assignment.deleteMany({});
  await AssignmentSubmission.deleteMany({});
  await AssignmentResult.deleteMany({});
  await StudentLedger.deleteMany({});

  console.log('\n--- 1. Seeding Data ---');

  // Instructor User
  const instructorUser = new User({
    _id: 'test-user-id',
    email: 'instructor@example.com',
    mobileNo: '9876543211',
    name: 'Test Instructor User',
    password: 'hashedpassword',
    profileStatus: 'Active',
  });
  await instructorUser.save();

  // Instructor
  const instructor = new Instructor({
    _id: 'test-instructor-id',
    userId: 'test-user-id',
    linkedInUrl: 'https://linkedin.com/in/test-instructor',
  });
  await instructor.save();

  // Student User
  const studentUser = new User({
    _id: 'test-student-user-id',
    email: 'student@example.com',
    mobileNo: '9876543210',
    name: 'Test Student User',
    password: 'hashedpassword',
    profileStatus: 'Active',
  });
  await studentUser.save();

  // Batch
  const batch = new Batch({
    _id: 'test-batch-id',
    name: 'Session Cohort 1',
    status: 'ongoing',
  });
  await batch.save();

  // Student
  const student = new Student({
    _id: 'test-student-id',
    enrollementNo: 'EN12345',
    userId: 'test-student-user-id',
    dob: new Date('2000-01-01'),
    batchId: 'test-batch-id',
    totalPoints: 100,
    enrolledCourseIds: ['test-course-id'],
  });
  await student.save();

  // Course
  const course = new Course({
    _id: 'test-course-id',
    name: 'Backend Web Dev 101',
    instructorIds: ['test-instructor-id'],
  });
  await course.save();

  // Topic
  const topic = new Topic({
    _id: 'test-topic-id',
    batchId: 'test-batch-id',
    title: 'Mongoose Validation & Hooks',
    description: 'Mongoose validators detail',
    learningObjectives: ['Objective 1'],
    estimatedHours: 2,
    orderIndex: 0,
  });
  await topic.save();

  // Scheduled upcoming session (3 days in future)
  const upcomingSession = new Session({
    _id: 'upcoming-session-id',
    title: 'Future Mongoose Lecture',
    courseId: 'test-course-id',
    instructorId: 'test-instructor-id',
    batchId: 'test-batch-id',
    topicIds: ['test-topic-id'],
    sessionDateAndTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    duration: '2 hours',
    status: 'scheduled',
    meetUrl: 'https://meet.google.com/abc-defg-hij',
  });
  await upcomingSession.save();

  // Completed past session (2 days ago)
  const completedSession = new Session({
    _id: 'completed-session-id',
    title: 'Past Mongoose Lecture',
    courseId: 'test-course-id',
    instructorId: 'test-instructor-id',
    batchId: 'test-batch-id',
    topicIds: ['test-topic-id'],
    sessionDateAndTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    duration: '2 hours',
    status: 'completed',
    meetUrl: 'https://meet.google.com/abc-defg-hij',
    endTime: '12:00',
  });
  await completedSession.save();

  // Attendance
  const attendance = new Attendance({
    _id: 'test-attendance-id',
    studentId: 'test-student-id',
    courseId: 'test-course-id',
    sessionId: 'completed-session-id',
    status: 'present',
  });
  await attendance.save();

  // Quiz
  const quiz = new Quiz({
    _id: 'test-quiz-id',
    title: 'Mongoose Hooks Quiz',
    sessionId: 'completed-session-id',
    submissionDeadline: new Date(),
  });
  await quiz.save();

  // Quiz Result
  const quizResult = new QuizResult({
    _id: 'test-quiz-result-id',
    studentId: 'test-student-id',
    quizId: 'test-quiz-id',
    totalMarks: 5,
    marksObtained: 4,
    percentage: 80,
    points: 4,
    totalPoints: 4,
  });
  await quizResult.save();

  // Assignment
  const assignment = new Assignment({
    _id: 'test-assignment-id',
    title: 'Mongoose Hooks Assignment',
    sessionId: 'completed-session-id',
    prompt: 'Implement pre-save Mongoose validator hooks.',
    submissionDeadline: new Date(),
    attachments: 'No attachments',
    instructions: 'Implement the task as described.',
    task: 'Mongoose Hooks Assignment',
  });
  await assignment.save();

  // Assignment Submission
  const submission = new AssignmentSubmission({
    _id: 'test-submission-id',
    studentId: 'test-student-id',
    assignmentId: 'test-assignment-id',
    gitSubmissionLink: 'https://github.com/test/mongoose',
    submittedAt: new Date(),
    onTimeSubmission: true,
  });
  await submission.save();

  // Assignment Result
  const assignmentResult = new AssignmentResult({
    _id: 'test-assignment-result-id',
    submissionId: 'test-submission-id',
    totalMarks: 10,
    marksObtained: 8,
    percentage: 80,
    points: 8,
    totalPoints: 8,
  });
  await assignmentResult.save();

  // Ledger Entry
  const ledger = new StudentLedger({
    _id: 'test-ledger-id',
    studentId: 'test-student-id',
    sourceType: 'assignment',
    sourceId: 'test-assignment-id',
    points: 8,
    description: 'Awarded for assignment submission',
  });
  await ledger.save();

  console.log('Seeded data successfully.');

  console.log('\n--- 2. Testing getInstructorProfile ---');
  const profile = await service.getInstructorProfile('test-user-id');
  console.log('Profile retrieved:', profile);
  if (profile.userId.name !== 'Test Instructor User') throw new Error('Instructor profile populate failed');

  console.log('\n--- 3. Testing updateInstructorProfile ---');
  const updated = await service.updateInstructorProfile('test-user-id', {
    name: 'Updated Instructor Name',
    designation: 'Senior Backend Engineer',
    bio: 'Lead MERN developer.',
  }, '/uploads/instructors/profile-pic.png');
  console.log('Updated profile:', updated);
  if (updated.userId.name !== 'Updated Instructor Name') throw new Error('User name update failed');
  if (updated.designation !== 'Senior Backend Engineer') throw new Error('Designation update failed');
  if (updated.photo !== '/uploads/instructors/profile-pic.png') throw new Error('Photo path update failed');

  console.log('\n--- 4. Testing getInstructorDashboard ---');
  let dashboard = await service.getInstructorDashboard('test-user-id');
  console.log('Dashboard stats:', dashboard);
  if (dashboard.upcomingSessions.length !== 1) throw new Error('Upcoming sessions aggregation failed');
  if (dashboard.pendingAttendance.length !== 0) throw new Error('Pending attendance check failed (attendance exists but returned as pending)');
  if (dashboard.pendingQuiz.length !== 0) throw new Error('Pending quiz check failed (quiz exists but returned as pending)');

  // Delete attendance and verify it shifts to pending
  await Attendance.deleteMany({});
  dashboard = await service.getInstructorDashboard('test-user-id');
  console.log('Dashboard after deleting attendance (pendingAttendance):', dashboard.pendingAttendance);
  if (dashboard.pendingAttendance.length !== 1) throw new Error('Pending attendance check failed (should list completes with no attendance)');

  // Delete quiz and verify it shifts to pending
  await Quiz.deleteMany({});
  dashboard = await service.getInstructorDashboard('test-user-id');
  console.log('Dashboard after deleting quiz (pendingQuiz):', dashboard.pendingQuiz);
  if (dashboard.pendingQuiz.length !== 1) throw new Error('Pending quiz check failed (should list completes with no quiz)');

  console.log('\n--- 5. Testing getInstructorBatches ---');
  const batches = await service.getInstructorBatches('test-user-id');
  console.log('Batches retrieved:', batches);
  if (batches.length !== 1) throw new Error('Batches resolution failed');

  console.log('\n--- 6. Testing getStudentBreakdown ---');
  const breakdown = await service.getStudentBreakdown('test-batch-id');
  console.log('Student Breakdown:', JSON.stringify(breakdown, null, 2));
  if (breakdown.length !== 1) throw new Error('Student breakdown retrieval failed');
  if (breakdown[0].ledger.length !== 1) throw new Error('Ledger list retrieval failed');

  console.log('\n--- 7. Testing getSessionSummary ---');
  // Re-seed attendance
  attendance.isNew = true;
  await attendance.save();
  // Re-seed quiz
  quiz.isNew = true;
  await quiz.save();

  const summary = await service.getSessionSummary('completed-session-id');
  console.log('Session summary metrics:', summary);
  if (summary.attendance.present !== 1) throw new Error('Attendance count present mismatch');
  if (summary.attendance.total !== 1) throw new Error('Attendance count total mismatch');
  if (summary.avgQuizScore !== 4) throw new Error('Quiz average calculation mismatch');
  if (summary.avgAssignmentScore !== 8) throw new Error('Assignment average calculation mismatch');

  console.log('\nALL MODULE 5 INTEGRATION TESTS PASSED SUCCESSFULLY! ✅');
}

runTests()
  .catch((err) => {
    console.error('\nTEST RUN FAILED ❌');
    console.error(err);
  })
  .finally(async () => {
    await disconnectDatabase();
    console.log('Disconnected from database.');
  });
