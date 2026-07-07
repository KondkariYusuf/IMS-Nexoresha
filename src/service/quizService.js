import {
    Quiz,
    QuizResult,
    Session,
    Student,
    User,
} from '../models/index.js';
import { CustomError } from '../../utils/customError.js';

async function applyMarksSafely(payload) {
    try {
        const pointsService = await import('./pointsService.js');

        if (typeof pointsService.applyMarkEvent === 'function') {
            await pointsService.applyMarkEvent(payload);
        }

        if (typeof pointsService.applyPoints === 'function') {
            await pointsService.applyPoints(payload);
        }
    } catch {
        // Do not block quiz upload if points service is unavailable.
    }
}

async function resolveStudent(row) {
    if (row.studentId) {
        return Student.findById(row.studentId);
    }

    const email = row.student_email || row.email;
    const user = await User.findOne({ email });

    if (!user) return null;

    return Student.findOne({ userId: user._id });
}

/* Controller-compatible names */

export async function createQuizService(data) {
    return Quiz.create(data);
}

export async function getAllQuizzesService() {
    return Quiz.find().sort({ createdAt: -1 });
}

export async function getQuizByIdService(id) {
    const quiz = await Quiz.findById(id);
    if (!quiz) throw new CustomError('Quiz not found.', 404);
    return quiz;
}

export async function updateQuizService(id, data) {
    const quiz = await Quiz.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    });

    if (!quiz) throw new CustomError('Quiz not found.', 404);

    return quiz;
}

export async function deleteQuizService(id) {
    const quiz = await Quiz.findById(id);
    if (!quiz) throw new CustomError('Quiz not found.', 404);

    await QuizResult.deleteMany({ quizId: id });
    await Quiz.findByIdAndDelete(id);

    return { deleted: true };
}

/* Dev4 required lecture quiz JSON upload */

export async function uploadLectureQuizResultsService({
    lectureId,
    teacherId,
    quiz,
}) {
    const session = await Session.findById(lectureId);

    if (!session) {
        throw new CustomError('Lecture/session not found', 404);
    }

    if (session.status === 'cancelled' || session.status === 'scheduled') {
        throw new CustomError(
            'Quiz can only be uploaded for in-progress or completed lectures',
            400,
        );
    }

    const processed = [];
    const errors = [];

    for (let i = 0; i < quiz.length; i += 1) {
        const row = quiz[i];
        const student = await resolveStudent(row);

        if (!student) {
            errors.push({
                row: i + 1,
                field: 'student',
                message: row.studentId
                    ? `Student not found: ${row.studentId}`
                    : `Student email not found: ${row.student_email || row.email}`,
            });
            continue;
        }

        const score = Number(row.score);

        const record = await QuizResult.findOneAndUpdate(
            {
                lectureId,
                studentId: student._id,
            },
            {
                studentId: student._id,
                quizId: row.quizId || lectureId,
                lectureId,
                totalMarks: 5,
                marksObtained: score,
                score,
                marksApplied: score,
                percentage: (score / 5) * 100,
                submittedAt: new Date(),
                uploadedBy: teacherId,
                feedback: row.feedback || '',
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
            },
        );

        await applyMarksSafely({
            studentId: student._id,
            batchId: student.batchId,
            lectureId,
            eventType: 'quiz',
            marksApplied: score,
            meta: {
                quizResultId: record._id,
            },
        });

        processed.push({
            studentId: student._id,
            score,
            marksApplied: score,
        });
    }

    if (errors.length > 0) {
        throw new CustomError('Quiz validation failed', 400, errors);
    }

    return {
        processed: processed.length,
        errors: [],
        summary: processed,
    };
}

export async function getLectureQuizResultsService(lectureId) {
    const session = await Session.findById(lectureId);

    if (!session) {
        throw new CustomError('Lecture/session not found', 404);
    }

    const quizResults = await QuizResult.find({ lectureId });

    return {
        totalStudents: quizResults.length,
        quizResults,
    };
}

/* Old quiz APIs kept for Dev4 compatibility */

export async function uploadQuizResultsService(data) {
    const { quizId, results } = data;

    if (!Array.isArray(results)) {
        throw new CustomError('results must be an array', 400);
    }

    const uploadedResults = [];

    for (const row of results) {
        const student = await Student.findById(row.studentId);

        if (!student) {
            throw new CustomError(`Student not found: ${row.studentId}`, 404);
        }

        const score = Number(row.score);

        if (Number.isNaN(score) || score < 0 || score > 5) {
            throw new CustomError(`Invalid score for ${row.studentId}`, 400);
        }

        const result = await QuizResult.findOneAndUpdate(
            {
                quizId,
                studentId: row.studentId,
            },
            {
                quizId,
                studentId: row.studentId,
                totalMarks: 5,
                marksObtained: score,
                score,
                marksApplied: score,
                percentage: (score / 5) * 100,
                submittedAt: new Date(),
                feedback: row.feedback || '',
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
            },
        );

        uploadedResults.push(result);
    }

    return uploadedResults;
}

export async function getQuizResultsService(quizId) {
    return QuizResult.find({ quizId }).sort({ createdAt: -1 });
}

export async function getStudentQuizResultsService(studentId) {
    return QuizResult.find({ studentId }).sort({ createdAt: -1 });
}