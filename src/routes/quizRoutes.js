import { Router } from "express";
import * as quizController from "../controller/quizController.js";
import {
    validateCreateQuiz,
    validateQuizUpload,
} from "../validator/quizValidator.js";

const router = Router();

// ======================================
// Quiz APIs
// ======================================

// Create Quiz
router.post(
    "/",
    validateCreateQuiz,
    quizController.createQuiz
);

// Get All Quizzes
router.get(
    "/",
    quizController.getAllQuizzes
);

// Get Quiz By ID
router.get(
    "/:id",
    quizController.getQuizById
);

// Update Quiz
router.put(
    "/:id",
    validateCreateQuiz,
    quizController.updateQuiz
);

// Delete Quiz
router.delete(
    "/:id",
    quizController.deleteQuiz
);

// ======================================
// Batch Quiz Result APIs
// ======================================

// Teacher uploads complete batch result JSON
router.post(
    "/upload-results",
    validateQuizUpload,
    quizController.uploadQuizResults
);

// Get all results of one quiz
router.get(
    "/results/:quizId",
    quizController.getQuizResults
);

// Get all quiz results of one student
router.get(
    "/student/:studentId",
    quizController.getStudentQuizResults
);

export default router;