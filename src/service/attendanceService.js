import {
  Attendance,
  AttendanceUpload,
  Session,
  Student,
  User,
} from '../models/index.js';
import { CustomError } from '../../utils/customError.js';
import { applyMarkEvent } from './pointsService.js';

function getStatus(firstHalf, secondHalf) {
  if (firstHalf && secondHalf) return 'present';
  if (firstHalf || secondHalf) return 'half';
  return 'absent';
}

function getMarks(status) {
  if (status === 'present') return 2.5;
  if (status === 'half') return 1;
  return -5;
}

async function resolveStudent(row) {
  if (row.studentId) return Student.findById(row.studentId);

  const email = row.student_email || row.email;
  const user = await User.findOne({ email });
  if (!user) return null;

  return Student.findOne({ userId: user._id });
}

export async function markAttendance({ lectureId, teacherId, attendance }) {
  const session = await Session.findById(lectureId);
  if (!session) throw new CustomError('Lecture/session not found', 404);

  if (['cancelled', 'scheduled'].includes(String(session.status).toLowerCase())) {
    throw new CustomError(
      'Attendance can only be uploaded for in-progress or completed lectures',
      400,
    );
  }

  const batchStudents = await Student.find({ batchId: session.batchId });
  const previousRecords = await Attendance.find({ lectureId });
  const previousMap = new Map(
    previousRecords.map((record) => [record.studentId, record.marksApplied || 0]),
  );

  const inputMap = new Map();

  for (let i = 0; i < attendance.length; i += 1) {
    const row = attendance[i];
    const student = await resolveStudent(row);

    if (!student) {
      throw new CustomError(
        row.studentId
          ? `Student not found: ${row.studentId}`
          : `Student email not found: ${row.student_email || row.email}`,
        404,
      );
    }

    inputMap.set(student._id, {
      student,
      firstHalf: row.first_half,
      secondHalf: row.second_half,
    });
  }

  const summary = [];

  for (const student of batchStudents) {
    const uploaded = inputMap.get(student._id);

    const firstHalf = uploaded ? uploaded.firstHalf : false;
    const secondHalf = uploaded ? uploaded.secondHalf : false;
    const status = getStatus(firstHalf, secondHalf);
    const marksApplied = getMarks(status);
    const oldMarks = previousMap.get(student._id) || 0;
    const delta = marksApplied - oldMarks;

    const record = await Attendance.findOneAndUpdate(
      { lectureId, studentId: student._id },
      {
        studentId: student._id,
        courseId: session.courseId || null,
        sessionId: lectureId,
        lectureId,
        status,
        firstHalf,
        secondHalf,
        marksApplied,
        markedBy: teacherId,
        markedAt: new Date(),
      },
      { new: true, upsert: true, runValidators: true },
    );

    if (delta !== 0) {
      await applyMarkEvent({
        studentId: student._id,
        batchId: student.batchId,
        lectureId,
        eventType: 'attendance',
        marksApplied: delta,
        meta: { attendanceId: record._id, replacement: oldMarks !== 0 },
      });
    }

    summary.push({
      studentId: student._id,
      status,
      marksApplied,
      oldMarks,
      delta,
      autoMarkedAbsent: !uploaded,
    });
  }

  await AttendanceUpload.create({
    lectureId,
    uploadedBy: teacherId,
    payload: attendance,
    processed: summary.length,
    errors: [],
    replacedPrevious: previousRecords.length > 0,
  });

  return {
    processed: summary.length,
    errors: [],
    summary,
  };
}

export async function getAttendanceByLecture(lectureId) {
  const session = await Session.findById(lectureId);
  if (!session) throw new CustomError('Lecture/session not found', 404);

  const attendance = await Attendance.find({ lectureId });

  return {
    totalStudents: attendance.length,
    attendance,
  };
}