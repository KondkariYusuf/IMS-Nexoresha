import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import recruiterRoutes from './recruiterRoutes.js';
import mockRoutes from './mockRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/recruiter', recruiterRoutes);
router.use('/mock', mockRoutes);

export default router;