// ===============================================
// Create Quiz Validation
// ===============================================
export function validateCreateQuiz(req, res, next) {
    const errors = [];

    const {
        title,
        batchId,
        sessionId,
        link,
        submissionDeadline,
        totalMarks,
        passingMarks,
        totaldurationInMins,
    } = req.body;

    // Title
    if (!title || typeof title !== "string" || title.trim() === "") {
        errors.push("Title is required.");
    }

    // Batch ID
    if (!batchId || typeof batchId !== "string") {
        errors.push("Batch ID is required.");
    }

    // Session ID
    if (!sessionId || typeof sessionId !== "string") {
        errors.push("Session ID is required.");
    }

    // Quiz Link
    if (!link || typeof link !== "string") {
        errors.push("Quiz link is required.");
    } else {
        try {
            new URL(link);
        } catch {
            errors.push("Quiz link must be a valid URL.");
        }
    }

    // Submission Deadline
    if (!submissionDeadline) {
        errors.push("Submission deadline is required.");
    } else if (isNaN(Date.parse(submissionDeadline))) {
        errors.push("Submission deadline must be a valid date.");
    }

    // Total Marks
    if (totalMarks === undefined || totalMarks === null) {
        errors.push("Total Marks is required.");
    } else if (isNaN(totalMarks)) {
        errors.push("Total Marks must be numeric.");
    } else if (Number(totalMarks) <= 0) {
        errors.push("Total Marks must be greater than 0.");
    }

    // Passing Marks
    if (passingMarks === undefined || passingMarks === null) {
        errors.push("Passing Marks is required.");
    } else if (isNaN(passingMarks)) {
        errors.push("Passing Marks must be numeric.");
    } else if (Number(passingMarks) < 0) {
        errors.push("Passing Marks cannot be negative.");
    } else if (Number(passingMarks) > Number(totalMarks)) {
        errors.push("Passing Marks cannot be greater than Total Marks.");
    }

    // Duration
    if (totaldurationInMins === undefined || totaldurationInMins === null) {
        errors.push("Quiz Duration is required.");
    } else if (isNaN(totaldurationInMins)) {
        errors.push("Quiz Duration must be numeric.");
    } else if (Number(totaldurationInMins) <= 0) {
        errors.push("Quiz Duration must be greater than 0.");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors,
        });
    }

    next();
}

// ===============================================
// Batch Quiz Upload Validation
// ===============================================
export function validateQuizUpload(req, res, next) {

    const { quizId, results } = req.body;

    if (!quizId || typeof quizId !== "string") {
        return res.status(400).json({
            success: false,
            message: "Quiz ID is required.",
        });
    }

    if (!Array.isArray(results) || results.length === 0) {
        return res.status(400).json({
            success: false,
            message: "results must be a non-empty array.",
        });
    }

    for (let i = 0; i < results.length; i++) {

        const row = results[i];

        if (!row.studentId || typeof row.studentId !== "string") {
            return res.status(400).json({
                success: false,
                message: `studentId is required at row ${i + 1}.`,
            });
        }

        if (row.score === undefined || row.score === null) {
            return res.status(400).json({
                success: false,
                message: `score is required at row ${i + 1}.`,
            });
        }

        if (isNaN(row.score)) {
            return res.status(400).json({
                success: false,
                message: `score must be numeric at row ${i + 1}.`,
            });
        }

        if (Number(row.score) < 0) {
            return res.status(400).json({
                success: false,
                message: `score cannot be negative at row ${i + 1}.`,
            });
        }
    }

    next();
}