import express from 'express';
import healthRoutes from './healthRoutes.js';
import adminRoutes from './adminRoutes.js';
import instructorRoutes from './instructor.routes.js';

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/admin', adminRoutes);
router.use('/v1/admin/teachers', instructorRoutes);

export default router;