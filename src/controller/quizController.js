import * as quizService from "../service/quizService.js";

// ======================================
// Quiz APIs
// ======================================

// Create Quiz
export async function createQuiz(req, res, next) {
    try {
        const quiz = await quizService.createQuiz(req.body);

        return res.status(201).json({
            success: true,
            message: "Quiz created successfully.",
            data: quiz,
        });
    } catch (error) {
        next(error);
    }
}

// Get All Quizzes
export async function getAllQuizzes(req, res, next) {
    try {
        const quizzes = await quizService.getAllQuizzes();

        return res.status(200).json({
            success: true,
            count: quizzes.length,
            data: quizzes,
        });
    } catch (error) {
        next(error);
    }
}

// Get Quiz By ID
export async function getQuizById(req, res, next) {
    try {
        const quiz = await quizService.getQuizById(req.params.id);

        return res.status(200).json({
            success: true,
            data: quiz,
        });
    } catch (error) {
        next(error);
    }
}

// Update Quiz
export async function updateQuiz(req, res, next) {
    try {
        const updatedQuiz = await quizService.updateQuiz(
            req.params.id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Quiz updated successfully.",
            data: updatedQuiz,
        });
    } catch (error) {
        next(error);
    }
}

// Delete Quiz
export async function deleteQuiz(req, res, next) {
    try {
        const result = await quizService.deleteQuiz(req.params.id);

        return res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        next(error);
    }
}

// ======================================
// Batch Quiz Result APIs
// ======================================

// Upload complete batch quiz results
export async function uploadQuizResults(req, res, next) {
    try {
        const result = await quizService.uploadQuizResults(req.body);

        return res.status(201).json({
            success: true,
            message: "Quiz results uploaded successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// Get all results of one quiz
export async function getQuizResults(req, res, next) {
    try {
        const results = await quizService.getQuizResults(req.params.quizId);

        return res.status(200).json({
            success: true,
            count: results.length,
            data: results,
        });
    } catch (error) {
        next(error);
    }
}

// Get all quiz results of one student
export async function getStudentQuizResults(req, res, next) {
    try {
        const results = await quizService.getStudentQuizResults(
            req.params.studentId
        );

        return res.status(200).json({
            success: true,
            count: results.length,
            data: results,
        });
    } catch (error) {
        next(error);
    }
}