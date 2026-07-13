import { CustomError } from '../../utils/customError.js';

export function validateCreateSubmission(req, _res, next) {
  const { studentId, assignmentId, gitSubmissionLink } = req.body;

  if (!studentId || studentId.trim() === '') {
    throw new CustomError('Student ID is required', 400);
  }

  if (!assignmentId || assignmentId.trim() === '') {
    throw new CustomError('Assignment ID is required', 400);
  }

  if (!gitSubmissionLink || gitSubmissionLink.trim() === '') {
    throw new CustomError('Git submission link is required', 400);
  }

  // Validate git URL format
  const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  if (!urlPattern.test(gitSubmissionLink)) {
    throw new CustomError('Invalid git submission link format', 400);
  }

  next();
}

export function validateUpdateSubmission(req, _res, next) {
  const { gitSubmissionLink } = req.body;

  if (gitSubmissionLink) {
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(gitSubmissionLink)) {
      throw new CustomError('Invalid git submission link format', 400);
    }
  }

  next();
}

export function validateSubmissionId(req, _res, next) {
  const { submissionId } = req.params;

  if (!submissionId || submissionId.trim() === '') {
    throw new CustomError('Submission ID is required', 400);
  }

  next();
}

export function validateStudentId(req, _res, next) {
  const { studentId } = req.params;

  if (!studentId || studentId.trim() === '') {
    throw new CustomError('Student ID is required', 400);
  }

  next();
}

export function validateAssignmentId(req, _res, next) {
  const { assignmentId } = req.params;

  if (!assignmentId || assignmentId.trim() === '') {
    throw new CustomError('Assignment ID is required', 400);
  }

  next();
}
