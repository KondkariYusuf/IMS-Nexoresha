import { Instructor, User, Session, Attendance, Quiz, QuizResult, Course, Student, StudentLedger, Assignment, AssignmentSubmission, AssignmentResult, Batch } from '../models/index.js';
import { CustomError } from '../../utils/customError.js';

/**
 * Get instructor profile populated with user details.
 */
export async function getInstructorProfile(userId) {
  const instructor = await Instructor.findOne({ userId }).populate({
    path: 'userId',
    select: 'name email mobileNo profileStatus',
  });
  if (!instructor) {
    throw new CustomError('Instructor profile not found', 404);
  }
  return instructor;
}

/**
 * Update instructor profile properties (designation, bio, photo, linkedIn) and associated User's name.
 */
export async function updateInstructorProfile(userId, updateData, profileImagePath) {
  const instructor = await Instructor.findOne({ userId });
  if (!instructor) {
    throw new CustomError('Instructor profile not found', 404);
  }

  const { name, phone, designation, bio, linkedInUrl } = updateData;

  if (name || phone) {
    const userUpdates = {};
    if (name) userUpdates.name = name;
    if (phone) userUpdates.mobileNo = phone;
    await User.findByIdAndUpdate(userId, userUpdates);
  }

  if (designation !== undefined) instructor.designation = designation;
  if (bio !== undefined) instructor.bio = bio;
  if (linkedInUrl !== undefined) instructor.linkedInUrl = linkedInUrl;
  if (profileImagePath !== undefined) instructor.profileImage = profileImagePath;

  await instructor.save();

  return getInstructorProfile(userId);
}

/**
 * Retrieve instructor dashboard metrics.
 */
export async function getInstructorDashboard(userId) {
  const instructor = await Instructor.findOne({ userId });
  if (!instructor) {
    throw new CustomError('Instructor profile not found', 404);
  }

  const now = new Date();
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // 1. Upcoming Sessions (scheduled in the next 7 days)
  const upcomingSessions = await Session.find({
    instructorId: instructor._id,
    status: 'scheduled',
    sessionDateAndTime: { $gte: now, $lte: sevenDaysLater },
  }).sort({ sessionDateAndTime: 1 });

  // Fetch all completed sessions for this instructor
  const completedSessions = await Session.find({
    instructorId: instructor._id,
    status: 'completed',
  });

  // 2. Pending Attendance Uploads (completed sessions with no attendance entries)
  const pendingAttendance = [];
  for (const session of completedSessions) {
    const attendanceExists = await Attendance.exists({ sessionId: session._id });
    if (!attendanceExists) {
      pendingAttendance.push(session);
    }
  }

  // 3. Pending Quiz Uploads (completed sessions with no quiz document)
  const pendingQuiz = [];
  for (const session of completedSessions) {
    const quizExists = await Quiz.exists({ sessionId: session._id });
    if (!quizExists) {
      pendingQuiz.push(session);
    }
  }

  return {
    upcomingSessions,
    pendingAttendance,
    pendingQuiz,
  };
}

/**
 * Retrieve all batches associated with the instructor.
 */
export async function getInstructorBatches(userId) {
  const instructor = await Instructor.findOne({ userId });
  if (!instructor) {
    throw new CustomError('Instructor profile not found', 404);
  }

  // Directly fetch batches assigned to this instructor by the admin
  const batches = await Batch.find({ _id: { $in: instructor.assignedBatches || [] } });

  return batches;
}

/**
 * Retrieve students enrolled in a batch along with their ledger details.
 */
export async function getStudentBreakdown(batchId) {
  const students = await Student.find({ batchId }).populate({
    path: 'userId',
    select: 'name email profileStatus',
  });

  const studentIds = students.map((s) => s._id);

  const ledgerEntries = await StudentLedger.find({
    studentId: { $in: studentIds },
    deletedAt: null,
  }).sort({ createdAt: -1 });

  const studentsWithBreakdown = students.map((student) => {
    const studentLedger = ledgerEntries.filter((entry) => entry.studentId === student._id);
    return {
      student,
      ledger: studentLedger,
    };
  });

  return studentsWithBreakdown;
}

/**
 * Retrieve metrics summary for a completed session.
 */
export async function getSessionSummary(sessionId) {
  const session = await Session.findById(sessionId);
  if (!session) {
    throw new CustomError('Session not found', 404);
  }

  // 1. Attendance Metrics
  const attendanceRecords = await Attendance.find({ sessionId });
  const attendanceCounts = {
    present: 0,
    absent: 0,
    leave: 0,
    half: 0,
    total: attendanceRecords.length,
  };
  for (const record of attendanceRecords) {
    if (attendanceCounts[record.status] !== undefined) {
      attendanceCounts[record.status]++;
    }
  }

  // 2. Average Quiz Score
  let avgQuizScore = 0;
  const quiz = await Quiz.findOne({ sessionId });
  if (quiz) {
    const quizResults = await QuizResult.find({ quizId: quiz._id });
    if (quizResults.length > 0) {
      const sum = quizResults.reduce((acc, curr) => acc + (curr.marksObtained || 0), 0);
      avgQuizScore = sum / quizResults.length;
    }
  }

  // 3. Average Assignment Score
  let avgAssignmentScore = 0;
  const assignment = await Assignment.findOne({ sessionId });
  if (assignment) {
    const submissions = await AssignmentSubmission.find({ assignmentId: assignment._id });
    const submissionIds = submissions.map((s) => s._id);
    if (submissionIds.length > 0) {
      const results = await AssignmentResult.find({ submissionId: { $in: submissionIds } });
      if (results.length > 0) {
        const sum = results.reduce((acc, curr) => acc + (curr.marksObtained || 0), 0);
        avgAssignmentScore = sum / results.length;
      }
    }
  }

  return {
    session,
    attendance: attendanceCounts,
    avgQuizScore,
    avgAssignmentScore,
  };
}
