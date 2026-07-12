import { Router } from 'express';
import {
  createAssignmentSubmission,
  getSubmission,
  getSubmissionsByAssignmentId,
  getSubmissionsByStudentId,
  updateAssignmentSubmission,
  deleteAssignmentSubmission,
  listAllSubmissions,
} from '../controller/assignmentSubmissionController.js';
import {
  validateCreateSubmission,
  validateUpdateSubmission,
  validateSubmissionId,
  validateStudentId,
  validateAssignmentId,
} from '../validator/assignmentSubmissionValidator.js';

const router = Router();

// List all submissions with optional filters
router.get('/', listAllSubmissions);

// Create new submission
router.post('/', validateCreateSubmission, createAssignmentSubmission);

// Get submission by ID
router.get('/:submissionId', validateSubmissionId, getSubmission);

// Get submissions by assignment ID
router.get('/assignment/:assignmentId', validateAssignmentId, getSubmissionsByAssignmentId);

// Get submissions by student ID
router.get('/student/:studentId', validateStudentId, getSubmissionsByStudentId);

// Update submission
router.put('/:submissionId', validateSubmissionId, validateUpdateSubmission, updateAssignmentSubmission);

// Delete submission
router.delete('/:submissionId', validateSubmissionId, deleteAssignmentSubmission);

export default router;
