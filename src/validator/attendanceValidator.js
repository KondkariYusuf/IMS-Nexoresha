import { CustomError } from '../../utils/customError.js';

export function validateAttendanceRequest(req, res, next) {
  const { attendance } = req.body;

  if (!Array.isArray(attendance)) {
    return next(new CustomError('attendance must be an array', 400));
  }

  for (let i = 0; i < attendance.length; i += 1) {
    const row = attendance[i];

    if (!row.studentId && !row.student_email && !row.email) {
      return next(
        new CustomError(
          `Row ${i + 1}: studentId or student_email is required`,
          400,
        ),
      );
    }

    if (typeof row.first_half !== 'boolean') {
      return next(
        new CustomError(`Row ${i + 1}: first_half must be boolean`, 400),
      );
    }

    if (typeof row.second_half !== 'boolean') {
      return next(
        new CustomError(`Row ${i + 1}: second_half must be boolean`, 400),
      );
    }
  }

  next();
}