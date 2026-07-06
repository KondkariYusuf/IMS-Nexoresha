import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import assignmentSubmissionRoutes from './assignmentSubmissionRoutes.js';
import studentRoutes from './studentRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/assignment-submissions', assignmentSubmissionRoutes);
router.use('/student', studentRoutes);

export default router;