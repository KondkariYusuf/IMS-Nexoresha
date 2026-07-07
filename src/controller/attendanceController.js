import {
  markAttendance,
  getAttendanceByLecture,
} from '../service/attendanceService.js';

export async function uploadAttendance(req, res, next) {
  try {
    const result = await markAttendance({
      lectureId: req.params.id,
      teacherId: req.user?.id,
      attendance: req.body.attendance,
    });

    return res.status(200).json({
      success: true,
      data: result,
      message: 'Attendance processed successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function getAttendance(req, res, next) {
  try {
    const result = await getAttendanceByLecture(req.params.id);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}