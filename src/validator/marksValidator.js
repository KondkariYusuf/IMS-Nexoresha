import { CustomError } from '../../utils/customError.js';
import { isEmptyValue } from '../../utils/commonFunctions.js';

const MIN_REASON_LENGTH = 20;

function assertReasonPresent(reason) {
    if (isEmptyValue(reason)) {
        throw new CustomError('reason is required', 400);
    }

    if (reason.trim().length < MIN_REASON_LENGTH) {
        throw new CustomError(
            `reason must be at least ${MIN_REASON_LENGTH} characters`,
            400,
        );
    }
}

function isNumeric(value) {
    return value !== undefined && value !== null && !Number.isNaN(Number(value));
}

export function validateOverrideMarks(req, _res, next) {
    const { studentId, delta, marks, reason } = req.body;
    const points = delta !== undefined ? delta : marks;

    if (isEmptyValue(studentId)) {
        throw new CustomError('studentId is required', 400);
    }

    if (!isNumeric(points)) {
        throw new CustomError('delta/marks must be numeric', 400);
    }

    assertReasonPresent(reason);

    next();
}

export function validateEventCorrection(req, _res, next) {
    const { ledgerEventId, newMark, newMarks, reason } = req.body;
    const correctedMark = newMark !== undefined ? newMark : newMarks;

    if (isEmptyValue(ledgerEventId)) {
        throw new CustomError('ledgerEventId is required', 400);
    }

    if (!isNumeric(correctedMark)) {
        throw new CustomError('newMark/newMarks must be numeric', 400);
    }

    assertReasonPresent(reason);

    next();
}

export function validateManualScore(req, _res, next) {
    const { studentId, submissionId, manualScore, marks, reason } = req.body;
    const points = manualScore !== undefined ? manualScore : marks;

    if (isEmptyValue(studentId)) {
        throw new CustomError('studentId is required', 400);
    }

    if (isEmptyValue(submissionId)) {
        throw new CustomError('submissionId is required', 400);
    }

    if (!isNumeric(points)) {
        throw new CustomError('manualScore/marks must be numeric', 400);
    }

    if (Number(points) < 0 || Number(points) > 10) {
        throw new CustomError('manualScore must be between 0 and 10', 400);
    }

    assertReasonPresent(reason);

    next();
}

export function validateRecalculateStudent(req, _res, next) {
    if (isEmptyValue(req.params.studentId)) {
        throw new CustomError('studentId param is required', 400);
    }

    assertReasonPresent(req.body.reason);

    next();
}

export function validateRecalculateBatch(req, _res, next) {
    if (isEmptyValue(req.params.batchId)) {
        throw new CustomError('batchId param is required', 400);
    }

    assertReasonPresent(req.body.reason);

    next();
}