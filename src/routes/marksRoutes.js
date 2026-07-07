import express from 'express';
import {
    overrideMarks,
    correctLedgerEvent,
    manualScore,
    recalculateStudent,
    recalculateBatch,
} from '../controller/marks.controller.js';
import {
    validateOverrideMarks,
    validateEventCorrection,
    validateManualScore,
    validateRecalculateStudent,
    validateRecalculateBatch,
} from '../validator/marksValidator.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken, requireRole('admin'));

router.post('/override', validateOverrideMarks, overrideMarks);
router.post('/event-correction', validateEventCorrection, correctLedgerEvent);
router.post('/manual-score', validateManualScore, manualScore);
router.post('/recalculate/:studentId', validateRecalculateStudent, recalculateStudent);
router.post('/recalculate-batch/:batchId', validateRecalculateBatch, recalculateBatch);

export default router;