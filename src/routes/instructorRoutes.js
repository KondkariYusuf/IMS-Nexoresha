import { Router } from 'express';
import * as instructorController from '../controller/instructorController.js';
import * as instructorValidator from '../validator/instructorValidator.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import {
  checkCourseAccess,
  checkBatchAccess,
  checkSessionAccess,
  checkTopicAccess,
  checkTopicReorderAccess,
} from '../middleware/instructorAccess.js';

const router = Router();

// Secure all instructor endpoints
router.use(verifyToken);

// ADMIN ONLY APIs (Access restricted to admin role for course administration)
router.put('/courses/:id', requireRole('admin'), instructorController.updateCourse);
router.delete('/courses/:id', requireRole('admin'), instructorController.deleteCourse);

router.use(requireRole(['instructor', 'teacher']));

// Course CRUD endpoints
router.post(
  '/courses',
  instructorValidator.createCourseValidator,
  instructorController.createCourse
);
router.get('/courses', instructorController.getCourses);

// Curriculum Topic CRUD endpoints
router.get(
  '/topics/:batchId',
  checkBatchAccess('batchId', 'params'),
  instructorController.getTopics
);

// Notes upload is mapped to body notes array; multer parses payload before validator runs
router.post(
  '/topics',
  instructorController.upload.array('notes', 5),
  checkBatchAccess('batchId', 'body'),
  instructorValidator.createTopicValidator,
  instructorController.createTopic
);

router.put(
  '/topics/:id',
  checkTopicAccess('id', 'params'),
  instructorValidator.updateTopicValidator,
  instructorController.updateTopic
);

router.delete(
  '/topics/:id',
  checkTopicAccess('id', 'params'),
  instructorController.deleteTopic
);

router.patch(
  '/topics/reorder',
  checkTopicReorderAccess,
  instructorValidator.reorderTopicsValidator,
  instructorController.reorderTopics
);

// Notes upload and deletion on existing topic
router.post(
  '/topics/:id/notes',
  checkTopicAccess('id', 'params'),
  instructorController.upload.array('notes', 5),
  instructorController.uploadNotes
);

router.delete(
  '/topics/:id/notes/:fileId',
  checkTopicAccess('id', 'params'),
  instructorController.deleteNote
);

// Session & Assignment Endpoints
router.get(
  '/sessions/:batchId',
  checkBatchAccess('batchId', 'params'),
  instructorController.getSessions
);

router.post(
  '/sessions',
  checkCourseAccess('courseId', 'body'),
  checkBatchAccess('batchId', 'body'),
  instructorValidator.createSessionValidator,
  instructorController.createSession
);

router.put(
  '/sessions/:id',
  checkSessionAccess('id', 'params'),
  instructorValidator.updateSessionValidator,
  instructorController.updateSession
);

router.patch(
  '/sessions/:id/status',
  checkSessionAccess('id', 'params'),
  instructorValidator.transitionStatusValidator,
  instructorController.transitionSessionStatus
);

router.delete(
  '/sessions/:id',
  checkSessionAccess('id', 'params'),
  instructorController.deleteSession
);

// Profile & Dashboard Endpoints
router.get('/profile', instructorController.getProfile);
router.put(
  '/profile',
  instructorController.uploadPhoto.single('profileImage'),
  instructorValidator.updateProfileValidator,
  instructorController.updateProfile
);
router.get('/dashboard', instructorController.getDashboard);
router.get('/batches', instructorController.getBatches);
router.get(
  '/students/:batchId',
  checkBatchAccess('batchId', 'params'),
  instructorValidator.batchIdParamValidator,
  instructorController.getStudentBreakdown
);
router.get(
  '/sessions/summary/:sessionId',
  checkSessionAccess('sessionId', 'params'),
  instructorValidator.sessionIdParamValidator,
  instructorController.getSessionSummary
);

export default router;
