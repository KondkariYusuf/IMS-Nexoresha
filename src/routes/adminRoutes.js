import { Router } from 'express';
import adminController from '../controller/adminController.js';
import {
    validateCreateStudent,
    validateCreateBatch,
    validateUpdateStudentStatus,
    validateMoveStudentToBatch,
    validateUpdateBatchConfig,
    validateAssignTeachersToBatch,
    validateBulkCreateStudents,
    validateUpdateStudent,
    validateUpdateBatch,
} from '../validator/adminValidator.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import instructorRoutes from './instructor.routes.js';

const router = Router();

router.use(verifyToken, requireRole('admin'));

router.use('/teachers', instructorRoutes);

router.get('/dashboard', adminController.getDashboard);

router.post('/students', validateCreateStudent, adminController.createStudent);
router.post('/students/bulk', validateBulkCreateStudents, adminController.bulkCreateStudents);
router.get('/students', adminController.getStudents);
router.get('/students/:id', adminController.getStudentById);
router.put('/students/:id', adminController.updateStudent);
router.patch('/students/:id/status', validateUpdateStudentStatus, adminController.updateStudentStatus);
router.patch('/students/:id/batch', validateMoveStudentToBatch, adminController.moveStudentToBatch);

router.post('/batches', validateCreateBatch, adminController.createBatch);
router.get('/batches', adminController.getBatches);
router.get('/batches/:id', adminController.getBatchById);
router.put('/batches/:id', adminController.updateBatch);
router.patch('/batches/:id/close', adminController.closeBatch);
router.post('/batches/:id/recruiter-link', adminController.generateRecruiterLink);
router.delete('/batches/:id/recruiter-link', adminController.revokeRecruiterLink);
router.patch('/batches/:id/teachers', validateAssignTeachersToBatch, adminController.assignTeachersToBatch);

router.get('/batch-config/:batchId', adminController.getBatchConfig);
router.put('/batch-config/:batchId', validateUpdateBatchConfig, adminController.updateBatchConfig);

router.put('/students/:id', validateUpdateStudent, adminController.updateStudent);
router.put('/batches/:id', validateUpdateBatch, adminController.updateBatch);

export default router;