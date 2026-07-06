import { AssignmentSubmission, Assignment, Student } from '../models/index.js';
import { CustomError } from '../../utils/customError.js';

export async function createSubmission(submissionData) {
  const { studentId, assignmentId, gitSubmissionLink, repoName, branchName, remarks } = submissionData;

  // Verify student exists
  const student = await Student.findById(studentId);
  if (!student) {
    throw new CustomError('Student not found', 404);
  }

  // Verify assignment exists
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new CustomError('Assignment not found', 404);
  }

  // Check if submission already exists for this student and assignment
  const existingSubmission = await AssignmentSubmission.findOne({ studentId, assignmentId });
  if (existingSubmission) {
    throw new CustomError('Submission already exists for this assignment', 400);
  }

  // Check if submission is on time
  const onTimeSubmission = new Date() <= new Date(assignment.submissionDeadline);

  const submission = new AssignmentSubmission({
    studentId,
    assignmentId,
    gitSubmissionLink,
    repoName: repoName || '',
    branchName: branchName || 'main',
    remarks: remarks || '',
    submittedAt: new Date(),
    onTimeSubmission,
  });

  return await submission.save();
}

export async function getSubmissionById(submissionId) {
  const submission = await AssignmentSubmission.findById(submissionId)
    .populate('studentId', 'name email')
    .populate('assignmentId', 'title prompt submissionDeadline');

  if (!submission) {
    throw new CustomError('Submission not found', 404);
  }

  return submission;
}

export async function getSubmissionsByAssignment(assignmentId) {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new CustomError('Assignment not found', 404);
  }

  return await AssignmentSubmission.find({ assignmentId })
    .populate('studentId', 'name email')
    .sort({ submittedAt: -1 });
}

export async function getSubmissionsByStudent(studentId) {
  const student = await Student.findById(studentId);
  if (!student) {
    throw new CustomError('Student not found', 404);
  }

  return await AssignmentSubmission.find({ studentId })
    .populate('assignmentId', 'title prompt submissionDeadline')
    .sort({ submittedAt: -1 });
}

export async function updateSubmission(submissionId, updateData) {
  const { gitSubmissionLink, repoName, branchName, remarks } = updateData;

  const submission = await AssignmentSubmission.findById(submissionId);
  if (!submission) {
    throw new CustomError('Submission not found', 404);
  }

  if (gitSubmissionLink) submission.gitSubmissionLink = gitSubmissionLink;
  if (repoName) submission.repoName = repoName;
  if (branchName) submission.branchName = branchName;
  if (remarks) submission.remarks = remarks;

  return await submission.save();
}

export async function deleteSubmission(submissionId) {
  const submission = await AssignmentSubmission.findByIdAndDelete(submissionId);

  if (!submission) {
    throw new CustomError('Submission not found', 404);
  }

  return submission;
}

export async function getAllSubmissions(filters = {}) {
  const query = {};

  if (filters.studentId) query.studentId = filters.studentId;
  if (filters.assignmentId) query.assignmentId = filters.assignmentId;
  if (filters.onTimeSubmission !== undefined) query.onTimeSubmission = filters.onTimeSubmission;

  return await AssignmentSubmission.find(query)
    .populate('studentId', 'name email')
    .populate('assignmentId', 'title prompt')
    .sort({ submittedAt: -1 });
}
