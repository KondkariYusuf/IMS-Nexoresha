import { Student } from '../models/index.js';

const studentPopulateOptions = [
  {
    path: 'userId',
    select: 'name email mobileNo profileStatus roleId createdAt updatedAt',
    populate: {
      path: 'roleId',
      select: 'name description',
    },
  },
  {
    path: 'batchId',
    select: 'name startDate endDate status',
  },
  {
    path: 'enrolledCourseIds',
    select: 'name instructorIds',
  },
];

export async function getAllStudents() {
  return Student.find()
    .populate(studentPopulateOptions)
    .sort({ enrollementNo: 1 })
    .lean();
}

export async function getStudentById(studentId) {
  if (!studentId) {
    throw new Error('studentId is required');
  }

  const student = await Student.findOne({ _id: studentId }).populate(studentPopulateOptions).lean();
  if (!student) {
    throw new Error('Student not found');
  }

  return student;
}
