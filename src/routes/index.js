import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import attendanceRoutes from './attendanceRoutes.js';
import quizRoutes from './quizRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/quiz', quizRoutes);

export default router;