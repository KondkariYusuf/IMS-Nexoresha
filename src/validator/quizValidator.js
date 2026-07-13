import { CustomError } from '../../utils/customError.js';

export function validateCreateQuiz(req, res, next) {
    next();
}

export function validateQuizUpload(req, res, next) {
    const { quiz } = req.body;

    if (!Array.isArray(quiz)) {
        return next(new CustomError('quiz must be an array', 400));
    }

    for (let i = 0; i < quiz.length; i += 1) {
        const row = quiz[i];

        if (!row.studentId && !row.student_email && !row.email) {
            return next(
                new CustomError(`Row ${i + 1}: studentId or student_email is required`, 400),
            );
        }

        if (row.score === undefined || row.score === null || row.score === '') {
            return next(new CustomError(`Row ${i + 1}: score is required`, 400));
        }

        const score = Number(row.score);

        if (Number.isNaN(score)) {
            return next(new CustomError(`Row ${i + 1}: score must be numeric`, 400));
        }

        if (score < 0 || score > 5) {
            return next(new CustomError(`Row ${i + 1}: score must be between 0 and 5`, 400));
        }
    }

    next();
}