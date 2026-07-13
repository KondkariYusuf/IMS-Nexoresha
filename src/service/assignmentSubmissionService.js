import { AssignmentSubmission, Assignment, Student, AssignmentResult } from '../models/index.js';
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
    .populate({
      path: 'studentId',
      populate: {
        path: 'userId',
        select: 'name email',
      },
    })
    .populate({
      path: 'assignmentId',
      select: 'title prompt submissionDeadline sessionId',
      populate: {
        path: 'sessionId',
        select: 'title',
      },
    });

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
    .populate({
      path: 'studentId',
      populate: {
        path: 'userId',
        select: 'name email',
      },
    })
    .sort({ submittedAt: -1 });
}

export async function getSubmissionsByStudent(studentId) {
  const student = await Student.findById(studentId);
  if (!student) {
    throw new CustomError('Student not found', 404);
  }

  return await AssignmentSubmission.find({ studentId })
    .populate({
      path: 'assignmentId',
      select: 'title prompt submissionDeadline sessionId',
      populate: {
        path: 'sessionId',
        select: 'title',
      },
    })
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

  const submissions = await AssignmentSubmission.find(query)
    .populate({
      path: 'studentId',
      populate: {
        path: 'userId',
        select: 'name email',
      },
    })
    .populate({
      path: 'assignmentId',
      select: 'title prompt sessionId',
      populate: {
        path: 'sessionId',
        select: 'title',
      },
    })
    .sort({ submittedAt: -1 })
    .lean();

  // Fetch results for these submissions to retrieve automated review scores/feedback
  const submissionIds = submissions.map(s => s._id);
  const results = await AssignmentResult.find({ submissionId: { $in: submissionIds } }).lean();
  
  const resultsMap = {};
  results.forEach(r => {
    resultsMap[r.submissionId] = r;
  });

  return submissions.map(s => ({
    ...s,
    result: resultsMap[s._id] || null
  }));
}

export async function getDetailedSubmissionsList() {
  const submissions = await AssignmentSubmission.find()
    .populate({
      path: 'studentId',
      populate: {
        path: 'userId',
        select: 'name email',
      },
    })
    .populate({
      path: 'assignmentId',
      select: 'title prompt sessionId',
      populate: {
        path: 'sessionId',
        select: 'title instructorId',
        populate: {
          path: 'instructorId',
          populate: {
            path: 'userId',
            select: 'name',
          },
        },
      },
    })
    .sort({ submittedAt: -1 })
    .lean();

  return submissions.map(s => {
    const username = s.studentId && s.studentId.userId ? s.studentId.userId.name : 'Unknown';
    const lecture = s.assignmentId && s.assignmentId.sessionId ? s.assignmentId.sessionId.title : 'Unknown';
    const prompt = s.assignmentId ? s.assignmentId.prompt : '';
    const githubUrl = s.gitSubmissionLink;

    let teacher = 'Unknown';
    if (
      s.assignmentId &&
      s.assignmentId.sessionId &&
      s.assignmentId.sessionId.instructorId &&
      s.assignmentId.sessionId.instructorId.userId
    ) {
      teacher = s.assignmentId.sessionId.instructorId.userId.name || 'Unknown';
    }

    return {
      githubUrl,
      username,
      lecture,
      prompt,
      teacher,
      submittedAt: s.submittedAt
    };
  });
}
