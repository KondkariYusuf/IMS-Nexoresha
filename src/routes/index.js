import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import metricsRoutes from './metricsRoutes.js';
import studentRoutes from './studentRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/metrics', metricsRoutes);
router.use('/students', studentRoutes);

export default router;