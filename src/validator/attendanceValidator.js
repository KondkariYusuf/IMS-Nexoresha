export function validateAttendanceRequest(req, res, next) {
  const { sessionId, courseId, attendance } = req.body;

  // Validate sessionId
  if (!sessionId) {
    return res.status(400).json({
      success: false,
      message: 'sessionId is required',
    });
  }

  // Validate courseId
  if (!courseId) {
    return res.status(400).json({
      success: false,
      message: 'courseId is required',
    });
  }

  // Validate attendance array
  if (!Array.isArray(attendance) || attendance.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'attendance must be a non-empty array',
    });
  }

  const studentIds = new Set();

  for (let i = 0; i < attendance.length; i++) {
    const student = attendance[i];

    if (!student.studentId) {
      return res.status(400).json({
        success: false,
        message: `studentId is missing at index ${i}`,
      });
    }

    if (studentIds.has(student.studentId)) {
      return res.status(400).json({
        success: false,
        message: `Duplicate studentId found at index ${i}`,
      });
    }

    studentIds.add(student.studentId);

    if (typeof student.first_half !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: `first_half must be boolean at index ${i}`,
      });
    }

    if (typeof student.second_half !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: `second_half must be boolean at index ${i}`,
      });
    }
  }

  next();
}