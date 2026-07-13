import { Router } from 'express';
import {
  createAssignmentSubmission,
  getSubmission,
  getSubmissionsByAssignmentId,
  getSubmissionsByStudentId,
  updateAssignmentSubmission,
  deleteAssignmentSubmission,
  listAllSubmissions,
  getDetailedSubmissions,
} from '../controller/assignmentSubmissionController.js';
import {
  validateCreateSubmission,
  validateUpdateSubmission,
  validateSubmissionId,
  validateStudentId,
  validateAssignmentId,
} from '../validator/assignmentSubmissionValidator.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

// Public endpoint (No Auth) - Get specific details: githubUrl, username, lecture, prompt
router.get('/details', getDetailedSubmissions);

// Secure all remaining assignment submission endpoints
router.use(verifyToken);

// List all submissions with optional filters (instructors, teachers, admins only)
router.get('/', requireRole(['instructor', 'teacher', 'admin']), listAllSubmissions);

// Create new submission
router.post('/', validateCreateSubmission, createAssignmentSubmission);

// Get submission by ID
router.get('/:submissionId', validateSubmissionId, getSubmission);

// Get submissions by assignment ID (instructors, teachers, admins only)
router.get('/assignment/:assignmentId', requireRole(['instructor', 'teacher', 'admin']), validateAssignmentId, getSubmissionsByAssignmentId);

// Get submissions by student ID (instructors, teachers, admins only)
router.get('/student/:studentId', requireRole(['instructor', 'teacher', 'admin']), validateStudentId, getSubmissionsByStudentId);

// Update submission
router.put('/:submissionId', validateSubmissionId, validateUpdateSubmission, updateAssignmentSubmission);

// Delete submission
router.delete('/:submissionId', validateSubmissionId, deleteAssignmentSubmission);

export default router;
