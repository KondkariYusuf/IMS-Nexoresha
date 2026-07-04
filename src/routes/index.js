import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import instructorRoutes from './instructorRoutes.js';

const router = Router();

// Group all v1 endpoints (instructor, and future student/admin routes)
const v1Router = Router();
v1Router.use('/instructor', instructorRoutes);

router.use('/health', healthRoutes);
router.use('/v1', v1Router);

export default router;