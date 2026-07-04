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

export default router;
