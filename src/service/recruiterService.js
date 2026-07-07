import { Student, Batch } from '../models/index.js';
import * as metricsService from './metricsService.js';
import { CustomError } from '../utils/customError.js';

const studentPopulateForRecruiter = [
  { path: 'userId', select: 'name email profileStatus' },
  { path: 'enrolledCourseIds', select: 'name' },
];

export async function getBatchOverviewService(batchUuid) {
  const batch = await Batch.findById(batchUuid).select('_id name').lean();
  if (!batch) {
    throw new CustomError('Batch not found', 404);
  }

  const totalStudents = await Student.countDocuments({ batchId: batchUuid });
  const activeStudents = await Student.countDocuments({ batchId: batchUuid, status: 'active' });
  const completedStudents = await Student.countDocuments({ batchId: batchUuid, status: 'completed' });

  return {
    success: true,
    batch: {
      id: batch._id,
      name: batch.name,
      totalStudents,
      activeStudents,
      completedStudents,
    },
  };
}

export async function getBatchStudentsService(batchUuid) {
  const students = await Student.find({ batchId: batchUuid })
    .populate(studentPopulateForRecruiter)
    .lean();

  const mapped = students.map((s) => ({
    id: s._id,
    name: s.userId?.name || null,
    email: s.userId?.email || null,
    status: s.status || null,
  }));

  return {
    success: true,
    students: mapped,
  };
}

export async function getStudentPortfolioService(batchUuid, studentId) {
  const student = await Student.findOne({ _id: studentId, batchId: batchUuid })
    .populate(studentPopulateForRecruiter)
    .lean();

  if (!student) {
    throw new CustomError('Student not found', 404);
  }

  const [attendance, overallScore] = await Promise.all([
    metricsService.getAttendanceRate(studentId, batchUuid),
    metricsService.getTotalScore(studentId),
  ]);

  const course = (student.enrolledCourseIds && student.enrolledCourseIds[0] && student.enrolledCourseIds[0].name) || null;

  return {
    success: true,
    student: {
      id: student._id,
      name: student.userId?.name || null,
      email: student.userId?.email || null,
      status: student.status || null,
      attendance,
      overallScore,
      course,
    },
  };
}
