import mongoose from "mongoose";

import { CustomError } from "../../utils/customError.js";

import Quiz from "../models/quiz.model.js";
import QuizResult from "../models/quizResult.model.js";
import Session from "../models/session.model.js";
import Student from "../models/student.model.js";
import StudentLedger from "../models/studentLedger.model.js";
import StudentMetrics from "../models/studentMetrics.model.js";

// ===================================================
// Helper : Recalculate Student Metrics
// ===================================================

async function recalculateStudentMetrics(studentId) {

    const quizResults = await QuizResult.find({ studentId });

    const totalPoints = quizResults.reduce(
        (sum, item) => sum + (item.totalPoints || 0),
        0
    );

    const totalPercentage = quizResults.reduce(
        (sum, item) => sum + (item.percentage || 0),
        0
    );

    const quizCompleted = quizResults.length;

    const quizAvgScore =
        quizCompleted === 0
            ? 0
            : totalPercentage / quizCompleted;

    await StudentMetrics.findOneAndUpdate(
        { studentId },
        {
            studentId,
            totalPoints,
            quizCompleted,
            totalQuiz: quizCompleted,
            quizAvgScore,
        },
        {
            new: true,
            upsert: true,
            runValidators: true,
        }
    );
}

// ===================================================
// Create Quiz
// ===================================================

export async function createQuiz(data) {

    const {
        title,
        batchId,
        sessionId,
        link,
        submissionDeadline,
        totalMarks,
        passingMarks,
        totaldurationInMins,
    } = data;

    const session = await Session.findById(sessionId);

    if (!session) {
        throw new CustomError("Session not found.", 404);
    }

    const existingQuiz = await Quiz.findOne({
        sessionId,
    });

    if (existingQuiz) {
        throw new CustomError(
            "Quiz already exists for this session.",
            409
        );
    }

    return await Quiz.create({
        title,
        batchId,
        sessionId,
        link,
        submissionDeadline,
        totalMarks,
        passingMarks,
        totaldurationInMins,
    });
}

// ===================================================
// Get All Quizzes
// ===================================================

export async function getAllQuizzes() {

    return await Quiz.find().sort({
        createdAt: -1,
    });

}

// ===================================================
// Get Quiz By ID
// ===================================================

export async function getQuizById(id) {

    const quiz = await Quiz.findById(id);

    if (!quiz) {
        throw new CustomError(
            "Quiz not found.",
            404
        );
    }

    return quiz;
}
// ===================================================
// Update Quiz
// ===================================================

export async function updateQuiz(id, data) {

    const existingQuiz = await Quiz.findById(id);

    if (!existingQuiz) {
        throw new CustomError(
            "Quiz not found.",
            404
        );
    }

    if (data.sessionId) {

        const session = await Session.findById(
            data.sessionId
        );

        if (!session) {
            throw new CustomError(
                "Session not found.",
                404
            );
        }

        const duplicateQuiz = await Quiz.findOne({
            sessionId: data.sessionId,
            _id: { $ne: id },
        });

        if (duplicateQuiz) {
            throw new CustomError(
                "Quiz already exists for this session.",
                409
            );
        }
    }

    return await Quiz.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
            runValidators: true,
        }
    );
}

// ===================================================
// Delete Quiz
// ===================================================

export async function deleteQuiz(id) {

    const quiz = await Quiz.findById(id);

    if (!quiz) {
        throw new CustomError(
            "Quiz not found.",
            404
        );
    }

    // Delete all quiz results of this quiz
    await QuizResult.deleteMany({
        quizId: id,
    });

    // Delete all ledger entries of this quiz
    await StudentLedger.deleteMany({
        sourceId: id,
        sourceType: "quiz",
    });

    // Delete quiz
    await Quiz.findByIdAndDelete(id);

    // Recalculate metrics for all affected students
    const students = await Student.find();

    for (const student of students) {
        await recalculateStudentMetrics(student._id);
    }

    return {
        message: "Quiz deleted successfully.",
    };
}
// ===================================================
// Upload Quiz Results of Complete Batch (JSON)
// ===================================================

export async function uploadQuizResults(data) {

    const { quizId, results } = data;

    // Validate quiz
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
        throw new CustomError(
            "Quiz not found.",
            404
        );
    }

    // Validate results array
    if (!Array.isArray(results) || results.length === 0) {
        throw new CustomError(
            "Results array is required.",
            400
        );
    }

    let session = null;

    // Transaction (works only on replica set)
    try {
        session = await mongoose.startSession();
        session.startTransaction();
    } catch (err) {
        session = null;
    }

    try {

        const uploadedResults = [];

        for (const row of results) {

            // ---------------- Student Validation ----------------

            const student = await Student.findById(
                row.studentId
            );

            if (!student) {
                throw new CustomError(
                    `Student not found : ${row.studentId}`,
                    404
                );
            }

            // Optional batch validation
            if (
                quiz.batchId &&
                student.batchId &&
                quiz.batchId !== student.batchId
            ) {
                throw new CustomError(
                    `${student._id} does not belong to this batch.`,
                    400
                );
            }

            const score = Number(row.score);

            if (isNaN(score)) {
                throw new CustomError(
                    `Invalid score for ${row.studentId}`,
                    400
                );
            }

            if (score < 0) {
                throw new CustomError(
                    `Score cannot be negative for ${row.studentId}`,
                    400
                );
            }

            if (score > Number(quiz.totalMarks)) {
                throw new CustomError(
                    `Score cannot exceed total marks for ${row.studentId}`,
                    400
                );
            }

            const percentage =
                (score / Number(quiz.totalMarks)) * 100;

            const result =
                score >= Number(quiz.passingMarks)
                    ? "pass"
                    : "failed";

            const points =
                result === "pass"
                    ? 10
                    : 0;

            // ---------------- Check Existing Quiz Result ----------------

            let quizResult =
                await QuizResult.findOne({
                    studentId: row.studentId,
                    quizId,
                });
                            // ===================================================
            // Create / Update Quiz Result
            // ===================================================

            if (!quizResult) {

                quizResult = await QuizResult.create({
                    studentId: row.studentId,
                    quizId,
                    totalMarks: Number(quiz.totalMarks),
                    marksObtained: score,
                    percentage,
                    points,
                    bonusPoints: 0,
                    totalPoints: points,
                    timeTakenInMins: row.timeTakenInMins || 0,
                    submittedAt: new Date(),
                    feedback: row.feedback || "",
                    result,
                });

            } else {

                quizResult = await QuizResult.findOneAndUpdate(
                    {
                        studentId: row.studentId,
                        quizId,
                    },
                    {
                        totalMarks: Number(quiz.totalMarks),
                        marksObtained: score,
                        percentage,
                        points,
                        bonusPoints: 0,
                        totalPoints: points,
                        timeTakenInMins:
                            row.timeTakenInMins || 0,
                        submittedAt: new Date(),
                        feedback: row.feedback || "",
                        result,
                    },
                    {
                        new: true,
                        runValidators: true,
                    }
                );

            }

            // ===================================================
            // Create / Update Student Ledger
            // ===================================================

            let ledger = await StudentLedger.findOne({
                studentId: row.studentId,
                sourceId: quizId,
                sourceType: "quiz",
            });

            if (!ledger) {

                await StudentLedger.create({
                    studentId: row.studentId,
                    sourceType: "quiz",
                    sourceId: quizId,
                    points,
                    description: `Quiz : ${quiz.title}`,
                });

            } else {

                await StudentLedger.findByIdAndUpdate(
                    ledger._id,
                    {
                        points,
                        description: `Quiz : ${quiz.title}`,
                    },
                    {
                        new: true,
                        runValidators: true,
                    }
                );

            }
                        // ===================================================
            // Recalculate Student Metrics
            // ===================================================

            await recalculateStudentMetrics(
                row.studentId
            );

            uploadedResults.push(quizResult);

        } // End for loop

        if (session) {
            await session.commitTransaction();
            session.endSession();
        }

        return uploadedResults;

    } catch (error) {

        if (session) {
            await session.abortTransaction();
            session.endSession();
        }

        throw error;
    }

}
// ===================================================
// Get All Results of One Quiz
// ===================================================

export async function getQuizResults(quizId) {

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
        throw new CustomError(
            "Quiz not found.",
            404
        );
    }

    return await QuizResult.find({
        quizId,
    }).sort({
        createdAt: -1,
    });

}

// ===================================================
// Get All Results of One Student
// ===================================================

export async function getStudentQuizResults(studentId) {

    return await QuizResult.find({
        studentId,
    }).sort({
        createdAt: -1,
    });

}