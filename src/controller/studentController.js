import * as studentService from '../service/studentService.js';

function sendError(res, error) {
  return res.status(500).json({
    success: false,
    message: error.message,
  });
}

export async function getAllStudents(req, res) {
  try {
    const students = await studentService.getAllStudents();
    return res.status(200).json({ success: true, data: students });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getStudentById(req, res) {
  try {
    const { studentId } = req.params;
    const student = await studentService.getStudentById(studentId);
    return res.status(200).json({ success: true, data: student });
  } catch (error) {
    return sendError(res, error);
  }
}
