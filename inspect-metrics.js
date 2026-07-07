import 'dotenv/config';
import { connectDatabase } from './config/database.js';
import { Student, Attendance, AssignmentSubmission, AssignmentResult, QuizResult, StudentLedger } from './src/models/index.js';

await connectDatabase();

const studentId = 'S001';
const student = await Student.findOne({ enrollementNo: studentId }).lean();
console.log('student', JSON.stringify(student, null, 2));

if (!student) {
  process.exit(0);
}

const attendance = await Attendance.find({ studentId: student._id }).lean();
const submissions = await AssignmentSubmission.find({ studentId: student._id }).lean();
const submissionIds = submissions.map((s) => s._id);
const results = await AssignmentResult.find({ submissionId: { $in: submissionIds } }).lean();
const quizResults = await QuizResult.find({ studentId: student._id }).lean();
const ledger = await StudentLedger.find({ studentId: student._id, deletedAt: null }).lean();

console.log('attendance', JSON.stringify(attendance, null, 2));
console.log('submissions', JSON.stringify(submissions, null, 2));
console.log('results', JSON.stringify(results, null, 2));
console.log('quizResults', JSON.stringify(quizResults, null, 2));
console.log('ledger', JSON.stringify(ledger, null, 2));
process.exit(0);
