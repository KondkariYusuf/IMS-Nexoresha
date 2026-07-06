import { Router } from 'express';
import { getAllStudents, getStudentById } from '../controller/studentController.js';

const router = Router();

router.get('/', getAllStudents);
router.get('/:studentId', getStudentById);

export default router;
