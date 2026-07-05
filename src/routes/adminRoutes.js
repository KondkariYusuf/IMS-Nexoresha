import { Router } from 'express';
import adminController from '../controller/adminController.js';
import {
    validateCreateStudent,
    validateCreateBatch,
} from '../validator/adminValidator.js';

const router = Router();

router.post(
    '/students',
    validateCreateStudent,
    adminController.createStudent,
);

router.get(
    '/students',
    adminController.getStudents,
);
router.get(
    '/students/:id',
    adminController.getStudentById,
);

router.put(
    '/students/:id',
    adminController.updateStudent,
);
router.patch(
    '/students/:id/status',
    adminController.updateStudentStatus,
);
router.patch(
    '/students/:id/batch',
    adminController.moveStudentToBatch,
);
router.post(
    '/batches',
    validateCreateBatch,
    adminController.createBatch,
);
router.get(
    '/batches',
    adminController.getBatches,
);
router.get(
    '/batches/:id',
    adminController.getBatchById,
);
router.put(
    '/batches/:id',
    adminController.updateBatch,
);
router.delete(
    '/batches/:id',
    adminController.deleteBatch,
);
router.patch(
    '/batches/:id/status',
    adminController.updateBatchStatus,
);
router.patch(
    '/batches/:id/close',
    adminController.closeBatch,
);
router.post(
    '/batches/:id/recruiter-link',
    adminController.generateRecruiterLink,
);
router.delete(
    '/batches/:id/recruiter-link',
    adminController.revokeRecruiterLink,
);
router.get(
    '/batch-config/:batchId',
    adminController.getBatchConfig,
);
router.put(
    '/batch-config/:batchId',
    adminController.updateBatchConfig,
);
export default router;