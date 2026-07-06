import express from 'express';
import healthRoutes from './healthRoutes.js';
import adminRoutes from './adminRoutes.js';
import instructorRoutes from './instructor.routes.js';
import metricsRoutes from './metricsRoutes.js';
import studentRoutes from './studentRoutes.js';

const router = express.Router();

router.use('/health', healthRoutes);

// Admin
router.use('/admin', adminRoutes);

// Teacher
router.use('/v1/admin/teachers', instructorRoutes);

// Existing main routes
router.use('/metrics', metricsRoutes);
router.use('/students', studentRoutes);

export default router;