import PDFDocument from 'pdfkit';
import {
  AssignmentResult,
  AssignmentSubmission,
  Student,
  StudentLedger,
  StudentMetrics,
  User,
} from '../models/index.js';
import { CustomError } from '../../utils/customError.js';

function writeKeyValue(doc, label, value) {
  doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
  doc.font('Helvetica').text(value || 'N/A');
}

export async function generatePortfolioPDF(studentId, _batchId, res) {
  const [student, user, metrics, ledgerEntries, submissions] = await Promise.all([
    Student.findById(studentId).lean(),
    User.findById(studentId).select('name email mobileNo profileStatus').lean(),
    StudentMetrics.findOne({ studentId }).lean(),
    StudentLedger.find({ studentId, deletedAt: null }).sort({ createdAt: -1 }).limit(10).lean(),
    AssignmentSubmission.find({ studentId })
      .populate('assignmentId', 'title submissionDeadline')
      .sort({ submittedAt: -1 })
      .limit(10)
      .lean(),
  ]);

  if (!student) {
    throw new CustomError('Student not found', 404);
  }

  const results = await AssignmentResult.find({
    submissionId: { $in: submissions.map((submission) => submission._id) },
  }).lean();
  const resultMap = new Map(results.map((result) => [result.submissionId, result]));

  const doc = new PDFDocument({ margin: 50 });
  const fileName = `portfolio_${user?.name || student.enrollementNo || studentId}.pdf`.replace(/\s+/g, '_');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

  doc.pipe(res);

  doc.fontSize(22).font('Helvetica-Bold').text('Student Portfolio', { align: 'center' });
  doc.moveDown(1);

  doc.fontSize(15).font('Helvetica-Bold').text('Student Information', { underline: true });
  doc.moveDown(0.4);
  doc.fontSize(11);
  writeKeyValue(doc, 'Name', user?.name);
  writeKeyValue(doc, 'Email', user?.email);
  writeKeyValue(doc, 'Mobile', user?.mobileNo);
  writeKeyValue(doc, 'Enrollment No', student.enrollementNo);
  writeKeyValue(doc, 'Institute', student.instituteName);
  writeKeyValue(doc, 'Qualification', student.educationQualification);
  writeKeyValue(doc, 'GitHub', student.gitHubUrl);
  writeKeyValue(doc, 'LinkedIn', student.linkedInUrl);
  doc.moveDown(1);

  doc.fontSize(15).font('Helvetica-Bold').text('Performance Summary', { underline: true });
  doc.moveDown(0.4);
  doc.fontSize(11);
  writeKeyValue(doc, 'Total Points', String(metrics?.totalPoints ?? student.totalPoints ?? 0));
  writeKeyValue(doc, 'Rank', String(metrics?.rank ?? 'N/A'));
  writeKeyValue(doc, 'Percentile', metrics?.percentile !== undefined ? `${metrics.percentile}%` : 'N/A');
  writeKeyValue(doc, 'Attendance', metrics?.attendancePercentage !== undefined ? `${metrics.attendancePercentage}%` : 'N/A');
  writeKeyValue(doc, 'Assignment Average', metrics?.assignmentAvgScore !== undefined ? String(metrics.assignmentAvgScore) : 'N/A');
  writeKeyValue(doc, 'Quiz Average', metrics?.quizAvgScore !== undefined ? String(metrics.quizAvgScore) : 'N/A');
  doc.moveDown(1);

  doc.fontSize(15).font('Helvetica-Bold').text('Recent Assignments', { underline: true });
  doc.moveDown(0.4);
  doc.fontSize(10).font('Helvetica');

  if (submissions.length === 0) {
    doc.text('No assignment submissions yet.');
  } else {
    submissions.forEach((submission, index) => {
      const result = resultMap.get(submission._id);
      doc.font('Helvetica-Bold').text(`${index + 1}. ${submission.assignmentId?.title || 'Assignment'}`);
      doc.font('Helvetica').text(`Repository: ${submission.gitSubmissionLink}`);
      doc.text(`Submitted At: ${submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'N/A'}`);
      doc.text(`On Time: ${submission.onTimeSubmission ? 'Yes' : 'No'}`);
      doc.text(`Review: ${result ? `${result.marksObtained}/${result.totalMarks} - ${result.result}` : 'Pending'}`);
      doc.moveDown(0.5);
    });
  }

  doc.moveDown(0.5);
  doc.fontSize(15).font('Helvetica-Bold').text('Recent Points Ledger', { underline: true });
  doc.moveDown(0.4);
  doc.fontSize(10).font('Helvetica');

  if (ledgerEntries.length === 0) {
    doc.text('No ledger entries yet.');
  } else {
    ledgerEntries.forEach((entry, index) => {
      doc.text(
        `${index + 1}. ${entry.sourceType || 'entry'} | ${entry.points || 0} points | ${entry.description || ''}`,
      );
    });
  }

  doc.moveDown(1.5);
  doc.fontSize(9).font('Helvetica').text(`Generated on ${new Date().toLocaleString()}`, {
    align: 'center',
  });

  doc.end();
}
