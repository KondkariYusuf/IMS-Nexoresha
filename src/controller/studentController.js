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

export async function createStudent(req, res, next) {
  try {
    const data = await studentService.createStudent(req);
    res.status(201).json({
      success: true,
      data,
      message: 'Student created successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function getDashboard(req, res, next) {
  try {
    const data = await studentService.getStudentDashboard(req);
    res.status(200).json({
      success: true,
      data,
      message: 'Dashboard retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function getMarksHistory(req, res, next) {
  try {
    const data = await studentService.getMarkHistory(req);
    res.status(200).json({
      success: true,
      data,
      message: 'Mark history retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function getProfile(req, res, next) {
  try {
    const data = await studentService.getStudentProfile(req);
    res.status(200).json({
      success: true,
      data,
      message: 'Profile retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const data = await studentService.updateStudentProfile(req);
    res.status(200).json({
      success: true,
      data,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function getCurriculum(req, res, next) {
  try {
    const data = await studentService.getStudentCurriculum(req);
    res.status(200).json({
      success: true,
      data,
      message: 'Curriculum retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
}


export async function listAssignments(req, res, next) {
  try {
    const data = await studentService.getStudentAssignments(req);
    res.status(200).json({
      success: true,
      data,
      count: data.length,
      message: 'Assignments retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function getAssignment(req, res, next) {
  try {
    const data = await studentService.getAssignmentDetail(req);
    res.status(200).json({
      success: true,
      data,
      message: 'Assignment retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function submitAssignment(req, res, next) {
  try {
    const data = await studentService.submitAssignment(req);
    res.status(201).json({
      success: true,
      data,
      message: 'Assignment submitted successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function getReview(req, res, next) {
  try {
    const data = await studentService.getAssignmentReview(req);
    res.status(200).json({
      success: true,
      data,
      message: 'Review retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function getPortfolio(req, res, next) {
  try {
    const data = await studentService.getStudentPortfolio(req);
    res.status(200).json({
      success: true,
      data,
      message: 'Portfolio retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function downloadPortfolioPDF(req, res, next) {
  try {
    await studentService.downloadPortfolioPDF(req, res);
  } catch (error) {
    next(error);
  }
}

export async function listNotifications(req, res, next) {
  try {
    const data = await studentService.getStudentNotifications(req);
    res.status(200).json({
      success: true,
      data,
      message: 'Notifications retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function readNotification(req, res, next) {
  try {
    const data = await studentService.markNotificationRead(req);
    res.status(200).json({
      success: true,
      data,
      message: 'Notification marked as read',
    });
  } catch (error) {
    next(error);
  }
}

export async function readAllNotifications(req, res, next) {
  try {
    const data = await studentService.markAllNotificationsRead(req);
    res.status(200).json({
      success: true,
      data,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
}
