import * as studentService from '../service/studentService.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const getAllStudents = asyncHandler(async (req, res) => {
  const students = await studentService.getAllStudents();
  return res.status(200).json({ success: true, data: students });
});

export const getStudentById = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const student = await studentService.getStudentById(studentId);
  return res.status(200).json({ success: true, data: student });
});
