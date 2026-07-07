import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import instructorRoutes from './instructorRoutes.js';
import adminRoutes from './adminRoutes.js';
import metricsRoutes from './metricsRoutes.js';
import studentRoutes from './studentRoutes.js';
import auditRoutes from './auditRoutes.js';
import marksRoutes from './marksRoutes.js';
import authRoutes from './authRoutes.js';

const router = Router();

// Group all v1 endpoints (instructor, and future student/admin routes)
const v1Router = Router();
v1Router.use('/instructor', instructorRoutes);

router.use('/health', healthRoutes);
router.use('/v1', v1Router);

router.use('/auth', authRoutes);

router.use('/admin', adminRoutes);
router.use('/admin/audit-log', auditRoutes);
router.use('/admin/marks', marksRoutes);

router.use('/metrics', metricsRoutes);
router.use('/students', studentRoutes);

export default router;