import { Instructor, Course, Batch, Student, Session, Topic } from '../models/index.js';
import { CustomError } from '../../utils/customError.js';

// Helper to resolve Instructor document ID from User JWT ID
async function getInstructorId(userId) {
  const instructor = await Instructor.findOne({ userId });
  if (!instructor) {
    throw new CustomError('Instructor profile not found for this user', 404);
  }
  return instructor._id;
}

/**
 * Middleware to check if the instructor is assigned to the course.
 */
export const checkCourseAccess = (paramName = 'id', source = 'params') => async (req, res, next) => {
  try {
    const courseId = source === 'body' ? req.body[paramName] : req.params[paramName];
    if (!courseId) {
      return next(new CustomError('Course ID is required', 400));
    }
    const instructorId = await getInstructorId(req.user.id);
    const course = await Course.findById(courseId);
    if (!course) {
      return next(new CustomError('Course not found', 404));
    }
    if (!course.instructorIds.includes(instructorId)) {
      return next(new CustomError('Access denied: You are not assigned to this course', 403));
    }
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if the instructor is assigned to the batch.
 */
export const checkBatchAccess = (paramName = 'batchId', source = 'params') => async (req, res, next) => {
  try {
    const batchId = source === 'body' ? req.body[paramName] : req.params[paramName];
    if (!batchId) {
      return next(new CustomError('Batch ID is required', 400));
    }
    const instructorId = await getInstructorId(req.user.id);
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return next(new CustomError('Batch not found', 404));
    }

    // Direct check: Is the instructor registered directly under batch.teacherIds?
    if (batch.teacherIds && batch.teacherIds.includes(instructorId)) {
      return next();
    }

    // Direct check: Is there a course in this batch assigned to this instructor?
    const hasAssignedCourse = await Course.exists({
      batchId,
      instructorIds: instructorId,
    });
    if (hasAssignedCourse) return next();

    const courses = await Course.find({ instructorIds: instructorId });
    const courseIds = courses.map((c) => c._id);
    
    // Check if any student in the batch is enrolled in these courses
    const studentEnrolled = await Student.exists({
      batchId,
      enrolledCourseIds: { $in: courseIds },
    });
    if (studentEnrolled) return next();

    // Check if any session in the batch is linked to these courses
    const sessionLinked = await Session.exists({
      batchId,
      courseId: { $in: courseIds },
    });
    if (sessionLinked) return next();

    next(new CustomError('Access denied: You are not assigned to this batch', 403));
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if the instructor has access to the session.
 */
export const checkSessionAccess = (paramName = 'id', source = 'params') => async (req, res, next) => {
  try {
    const sessionId = source === 'body' ? req.body[paramName] : req.params[paramName];
    if (!sessionId) {
      return next(new CustomError('Session ID is required', 400));
    }
    const instructorId = await getInstructorId(req.user.id);
    const session = await Session.findById(sessionId);
    if (!session) {
      return next(new CustomError('Session not found', 404));
    }
    
    // Verify direct session leadership or course assignment
    if (session.instructorId === instructorId) {
      return next();
    }
    const course = await Course.findById(session.courseId);
    if (course && course.instructorIds.includes(instructorId)) {
      return next();
    }

    next(new CustomError('Access denied: You are not assigned to this course/session', 403));
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if the instructor has access to the topic's batch.
 */
export const checkTopicAccess = (paramName = 'id', source = 'params') => async (req, res, next) => {
  try {
    const topicId = source === 'body' ? req.body[paramName] : req.params[paramName];
    if (!topicId) {
      return next(new CustomError('Topic ID is required', 400));
    }
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return next(new CustomError('Topic not found', 404));
    }
    
    const instructorId = await getInstructorId(req.user.id);

    // Direct check: Is the instructor registered directly under batch.teacherIds?
    const batch = await Batch.findById(topic.batchId);
    if (batch && batch.teacherIds && batch.teacherIds.includes(instructorId)) {
      return next();
    }

    // Direct check: Is there a course in this batch assigned to this instructor?
    const hasAssignedCourse = await Course.exists({
      batchId: topic.batchId,
      instructorIds: instructorId,
    });
    if (hasAssignedCourse) return next();

    const courses = await Course.find({ instructorIds: instructorId });
    const courseIds = courses.map((c) => c._id);
    
    const studentEnrolled = await Student.exists({
      batchId: topic.batchId,
      enrolledCourseIds: { $in: courseIds },
    });
    if (studentEnrolled) return next();

    const sessionLinked = await Session.exists({
      batchId: topic.batchId,
      courseId: { $in: courseIds },
    });
    if (sessionLinked) return next();

    next(new CustomError('Access denied: You are not assigned to this batch', 403));
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check access for topic reordering array.
 */
export const checkTopicReorderAccess = async (req, res, next) => {
  try {
    const topicIds = req.body.topicIds;
    if (!topicIds || topicIds.length === 0) {
      return next(new CustomError('Topic IDs are required for reordering', 400));
    }
    const firstTopic = await Topic.findById(topicIds[0]);
    if (!firstTopic) {
      return next(new CustomError('Topic not found', 404));
    }

    const instructorId = await getInstructorId(req.user.id);

    // Direct check: Is the instructor registered directly under batch.teacherIds?
    const batch = await Batch.findById(firstTopic.batchId);
    if (batch && batch.teacherIds && batch.teacherIds.includes(instructorId)) {
      return next();
    }

    // Direct check: Is there a course in this batch assigned to this instructor?
    const hasAssignedCourse = await Course.exists({
      batchId: firstTopic.batchId,
      instructorIds: instructorId,
    });
    if (hasAssignedCourse) return next();

    const courses = await Course.find({ instructorIds: instructorId });
    const courseIds = courses.map((c) => c._id);
    
    const studentEnrolled = await Student.exists({
      batchId: firstTopic.batchId,
      enrolledCourseIds: { $in: courseIds },
    });
    if (studentEnrolled) return next();

    const sessionLinked = await Session.exists({
      batchId: firstTopic.batchId,
      courseId: { $in: courseIds },
    });
    if (sessionLinked) return next();

    next(new CustomError('Access denied: You are not assigned to this batch', 403));
  } catch (error) {
    next(error);
  }
};
