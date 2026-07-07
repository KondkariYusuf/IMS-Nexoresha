import {
  Attendance,
  Course,
  Session,
  Student,
  User,
} from '../models/index.js';
import { CustomError } from '../../utils/customError.js';

function getAttendanceStatus(firstHalf, secondHalf) {
  if (firstHalf && secondHalf) return 'present';
  if (firstHalf || secondHalf) return 'half';
  return 'absent';
}

function getAttendanceMarks(status) {
  if (status === 'present') return 2.5;
  if (status === 'half') return 1.0;
  return -5.0;
}

async function applyMarksSafely(payload) {
  try {
    const pointsService = await import('./pointsService.js');

    if (typeof pointsService.applyMarkEvent === 'function') {
      await pointsService.applyMarkEvent(payload);
    }

    if (typeof pointsService.applyPoints === 'function') {
      await pointsService.applyPoints(payload);
    }
  } catch {
    // Marks service is optional here so attendance does not crash.
  }
}

async function resolveStudent(row) {
  if (row.studentId) {
    return Student.findById(row.studentId);
  }

  const email = row.student_email || row.email;

  const user = await User.findOne({ email });

  if (!user) return null;

  return Student.findOne({ userId: user._id });
}

export async function markAttendance({ lectureId, teacherId, attendance }) {
  const session = await Session.findById(lectureId);

  if (!session) {
    throw new CustomError('Lecture/session not found', 404);
  }

  if (session.status === 'cancelled' || session.status === 'scheduled') {
    throw new CustomError(
      'Attendance can only be uploaded for in-progress or completed lectures',
      400,
    );
  }

  const courseId = session.courseId || null;

  if (courseId) {
    const course = await Course.findById(courseId);

    if (!course) {
      throw new CustomError('Course not found', 404);
    }
  }

  const processed = [];
  const errors = [];

  for (let i = 0; i < attendance.length; i += 1) {
    const row = attendance[i];
    const student = await resolveStudent(row);

    if (!student) {
      errors.push({
        row: i + 1,
        field: 'student',
        message: row.studentId
          ? `Student not found: ${row.studentId}`
          : `Student email not found: ${row.student_email || row.email}`,
      });
      continue;
    }

    const status = getAttendanceStatus(row.first_half, row.second_half);
    const marksApplied = getAttendanceMarks(status);

    const record = await Attendance.findOneAndUpdate(
      {
        lectureId,
        studentId: student._id,
      },
      {
        studentId: student._id,
        courseId,
        sessionId: lectureId,
        lectureId,
        status,
        firstHalf: row.first_half,
        secondHalf: row.second_half,
        marksApplied,
        markedBy: teacherId,
        markedAt: new Date(),
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );

    await applyMarksSafely({
      studentId: student._id,
      batchId: student.batchId,
      lectureId,
      eventType: 'attendance',
      marksApplied,
      meta: {
        attendanceId: record._id,
      },
    });

    processed.push({
      studentId: student._id,
      status,
      marksApplied,
    });
  }

  if (errors.length > 0) {
    throw new CustomError('Attendance validation failed', 400, errors);
  }

  return {
    processed: processed.length,
    errors: [],
    summary: processed,
  };
}

export async function getAttendanceByLecture(lectureId) {
  const session = await Session.findById(lectureId);

  if (!session) {
    throw new CustomError('Lecture/session not found', 404);
  }

  const attendance = await Attendance.find({ lectureId });

  return {
    totalStudents: attendance.length,
    attendance,
  };
}