import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import recruiterRoutes from './recruiterRoutes.js';
import mockRoutes from './mockRoutes.js';
import metricsRoutes from './metricsRoutes.js';
import studentRoutes from './studentRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/recruiter', recruiterRoutes);
router.use('/mock', mockRoutes);
router.use('/metrics', metricsRoutes);
router.use('/students', studentRoutes);

export default router;