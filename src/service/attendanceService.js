import { Attendance, Course, Session, Student } from '../models/index.js';
import { CustomError } from '../../utils/customError.js';

/**
 * Convert first_half and second_half into attendance status.
 */
function getAttendanceStatus(firstHalf, secondHalf) {
  if (firstHalf && secondHalf) {
    return 'present';
  }

  if (firstHalf || secondHalf) {
    return 'half';
  }

  return 'absent';
}

/**
 * Mark attendance for a session.
 */
export async function markAttendance(data) {
  const { sessionId, courseId, attendance } = data;

  // Check session
  const session = await Session.findById(sessionId);

  if (!session) {
    throw new CustomError('Session not found', 404);
  }

  // Check course
  const course = await Course.findById(courseId);

  if (!course) {
    throw new CustomError('Course not found', 404);
  }

  const attendanceRecords = [];

  for (const student of attendance) {
    // Check student
    const studentExists = await Student.findById(student.studentId);

    if (!studentExists) {
      throw new CustomError(
        `Student not found: ${student.studentId}`,
        404,
      );
    }

    attendanceRecords.push({
      studentId: student.studentId,
      courseId,
      sessionId,
      status: getAttendanceStatus(
        student.first_half,
        student.second_half,
      ),
      markedAt: new Date(),
    });
  }

  await Attendance.insertMany(attendanceRecords);

  return {
    success: true,
    message: 'Attendance marked successfully.',
    totalStudents: attendanceRecords.length,
  };
}

export async function reUploadAttendance(data) {
  const { sessionId } = data;

  // Delete all previous attendance for this session
  await Attendance.deleteMany({ sessionId });

  // Reuse upload logic
  return await markAttendance(data);
}

export async function getAttendanceBySession(sessionId) {
  const session = await Session.findById(sessionId);

  if (!session) {
    throw new CustomError('Session not found', 404);
  }

  const attendance = await Attendance.find({ sessionId });

  return {
    success: true,
    totalStudents: attendance.length,
    attendance,
  };
}