import express from 'express';
import healthRoutes from './healthRoutes.js';
<<<<<<< HEAD
import attendanceRoutes from './attendanceRoutes.js';
import quizRoutes from './quizRoutes.js';
=======
import adminRoutes from './adminRoutes.js';
import metricsRoutes from './metricsRoutes.js';
import studentRoutes from './studentRoutes.js';
import auditRoutes from './auditRoutes.js';
import marksRoutes from './marksRoutes.js';
import authRoutes from './authRoutes.js';
>>>>>>> origin/feature/alia-vedika/admin

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/quiz', quizRoutes);

router.use('/auth', authRoutes);

router.use('/admin', adminRoutes);
router.use('/admin/audit-log', auditRoutes);
router.use('/admin/marks', marksRoutes);

router.use('/metrics', metricsRoutes);
router.use('/students', studentRoutes);

export default router;