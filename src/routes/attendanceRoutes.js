import { Router } from 'express';
import {
  uploadAttendance,
  uploadAttendanceAgain,
  getAttendance,
} from '../controller/attendanceController.js';

import { validateAttendanceRequest } from '../validator/attendanceValidator.js';

const router = Router();

router.post(
  '/',
  validateAttendanceRequest,
  uploadAttendance,
);

router.put(
  '/reupload',
  validateAttendanceRequest,
  uploadAttendanceAgain,
);

router.get(
  '/session/:sessionId',
  getAttendance,
);

export default router;