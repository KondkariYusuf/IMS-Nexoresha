import { Router } from 'express';
import adminController from '../controller/adminController.js';
import { validateCreateStudent } from '../validator/adminValidator.js';

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
export default router;