import { Router } from 'express';
import * as instructorController from '../controller/instructorController.js';
import * as instructorValidator from '../validator/instructorValidator.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

// Secure all instructor endpoints
router.use(verifyToken);

// ADMIN ONLY APIs (Access restricted to admin role for course administration)
router.put('/courses/:id', requireRole('admin'), instructorController.updateCourse);
router.delete('/courses/:id', requireRole('admin'), instructorController.deleteCourse);

router.use(requireRole('instructor'));

// Course CRUD endpoints
router.post(
  '/courses',
  instructorValidator.createCourseValidator,
  instructorController.createCourse
);
router.get('/courses', instructorController.getCourses);

// Curriculum Topic CRUD endpoints
router.get('/topics/:batchId', instructorController.getTopics);

// Notes upload is mapped to body notes array; multer parses payload before validator runs
router.post(
  '/topics',
  instructorController.upload.array('notes', 5),
  instructorValidator.createTopicValidator,
  instructorController.createTopic
);

router.put(
  '/topics/:id',
  instructorValidator.updateTopicValidator,
  instructorController.updateTopic
);

router.delete('/topics/:id', instructorController.deleteTopic);

router.patch(
  '/topics/reorder',
  instructorValidator.reorderTopicsValidator,
  instructorController.reorderTopics
);

// Notes upload and deletion on existing topic
router.post(
  '/topics/:id/notes',
  instructorController.upload.array('notes', 5),
  instructorController.uploadNotes
);

router.delete('/topics/:id/notes/:fileId', instructorController.deleteNote);

// Session & Assignment Endpoints
router.get('/sessions/:batchId', instructorController.getSessions);

router.post(
  '/sessions',
  instructorValidator.createSessionValidator,
  instructorController.createSession
);

router.put(
  '/sessions/:id',
  instructorValidator.updateSessionValidator,
  instructorController.updateSession
);

router.patch(
  '/sessions/:id/status',
  instructorValidator.transitionStatusValidator,
  instructorController.transitionSessionStatus
);

router.delete('/sessions/:id', instructorController.deleteSession);

// Profile & Dashboard Endpoints
router.get('/profile', instructorController.getProfile);
router.put(
  '/profile',
  instructorController.uploadPhoto.single('photo'),
  instructorValidator.updateProfileValidator,
  instructorController.updateProfile
);
router.get('/dashboard', instructorController.getDashboard);
router.get('/batches', instructorController.getBatches);
router.get(
  '/students/:batchId',
  instructorValidator.batchIdParamValidator,
  instructorController.getStudentBreakdown
);
router.get(
  '/sessions/summary/:sessionId',
  instructorValidator.sessionIdParamValidator,
  instructorController.getSessionSummary
);

export default router;
