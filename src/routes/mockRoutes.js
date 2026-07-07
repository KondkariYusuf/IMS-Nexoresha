import { Router } from 'express';
import { mockStudentsController } from '../controller/mockController.js';

const router = Router();

router.get('/students', mockStudentsController);

export default router;
