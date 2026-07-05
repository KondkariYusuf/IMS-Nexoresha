import {
  markAttendance,
  reUploadAttendance,
  getAttendanceBySession,
} from '../service/attendanceService.js';

export async function uploadAttendance(req, res, next) {
  try {
    const result = await markAttendance(req.body);

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function uploadAttendanceAgain(req, res, next) {
  try {
    const result = await reUploadAttendance(req.body);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getAttendance(req, res, next) {
  try {
    const { sessionId } = req.params;

    const result = await getAttendanceBySession(sessionId);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}