import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import instructorRoutes from './instructorRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/instructor', instructorRoutes);

export default router;