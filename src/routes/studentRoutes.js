import { Router } from 'express';
import {
  getAllStudents,
  getStudentById,
  createStudent,
  getDashboard,
  getMarksHistory,
  getProfile,
  updateProfile,
  getCurriculum,
  listAssignments,
  getAssignment,
  submitAssignment,
  getReview,
  getPortfolio,
  downloadPortfolioPDF,
  listNotifications,
  readNotification,
  readAllNotifications,
} from '../controller/studentController.js';
import {
  validateCreateStudent,
  validateAssignmentSubmission,
  validateProfileUpdate,
  validatePagination,
  validateAssignmentId,
  validateNotificationId,
} from '../validator/studentValidator.js';

const router = Router();

// General admin student fetch routes
router.get('/', getAllStudents);
router.get('/:studentId', getStudentById);

// Create student
router.post('/', validateCreateStudent, createStudent);

// Dashboard
router.get('/dashboard', getDashboard);

// Mark history
router.get(
  '/marks/history',
  validatePagination,
  getMarksHistory
);

// Profile
router.get('/profile', getProfile);
router.put(
  '/profile',
  validateProfileUpdate,
  updateProfile
);

// Curriculum
router.get('/curriculum', getCurriculum);

// Assignments
router.get(
  '/assignments',
  listAssignments
);

router.get(
  '/assignments/:id',
  validateAssignmentId,
  getAssignment
);

router.post(
  '/assignments/:id/submit',
  validateAssignmentId,
  validateAssignmentSubmission,
  submitAssignment
);

// Code Review
router.get(
  '/assignments/:id/review',
  validateAssignmentId,
  getReview
);

// Portfolio
router.get('/portfolio', getPortfolio);

router.get(
  '/portfolio/pdf',
  downloadPortfolioPDF
);

// Notifications
router.get(
  '/notifications',
  validatePagination,
  listNotifications
);

router.patch(
  '/notifications/:id/read',
  validateNotificationId,
  readNotification
);

router.patch(
  '/notifications/read-all',
  readAllNotifications
);

export default router;
