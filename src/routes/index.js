import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import attendanceRoutes from './attendanceRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/attendance', attendanceRoutes);

export default router;