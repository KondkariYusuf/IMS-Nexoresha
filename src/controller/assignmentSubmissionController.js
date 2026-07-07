import {
  createSubmission,
  getSubmissionById,
  getSubmissionsByAssignment,
  getSubmissionsByStudent,
  updateSubmission,
  deleteSubmission,
  getAllSubmissions,
} from '../service/assignmentSubmissionService.js';

export async function createAssignmentSubmission(req, res, next) {
  try {
    const submission = await createSubmission(req.body);
    res.status(201).json({
      message: 'Assignment submission created successfully',
      data: submission,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSubmission(req, res, next) {
  try {
    const submission = await getSubmissionById(req.params.submissionId);
    res.status(200).json({
      message: 'Assignment submission retrieved successfully',
      data: submission,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSubmissionsByAssignmentId(req, res, next) {
  try {
    const submissions = await getSubmissionsByAssignment(req.params.assignmentId);
    res.status(200).json({
      message: 'Submissions retrieved successfully',
      data: submissions,
      count: submissions.length,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSubmissionsByStudentId(req, res, next) {
  try {
    const submissions = await getSubmissionsByStudent(req.params.studentId);
    res.status(200).json({
      message: 'Student submissions retrieved successfully',
      data: submissions,
      count: submissions.length,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAssignmentSubmission(req, res, next) {
  try {
    const submission = await updateSubmission(req.params.submissionId, req.body);
    res.status(200).json({
      message: 'Assignment submission updated successfully',
      data: submission,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAssignmentSubmission(req, res, next) {
  try {
    const submission = await deleteSubmission(req.params.submissionId);
    res.status(200).json({
      message: 'Assignment submission deleted successfully',
      data: submission,
    });
  } catch (error) {
    next(error);
  }
}

export async function listAllSubmissions(req, res, next) {
  try {
    const filters = req.query;
    const submissions = await getAllSubmissions(filters);
    res.status(200).json({
      message: 'All submissions retrieved successfully',
      data: submissions,
      count: submissions.length,
    });
  } catch (error) {
    next(error);
  }
}
