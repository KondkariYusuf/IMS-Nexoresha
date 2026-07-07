import { Router } from 'express';
import {
  getBatchOverview,
  getBatchStudents,
  getStudentPortfolio,
} from '../controller/recruiterController.js';

const router = Router();

router.get('/:batchUuid', getBatchOverview);

router.get('/:batchUuid/students', getBatchStudents);

router.get('/:batchUuid/students/:id', getStudentPortfolio);

export default router;