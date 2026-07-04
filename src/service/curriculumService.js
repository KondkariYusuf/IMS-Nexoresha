import { Topic, Course, Session } from '../models/index.js';
import { CustomError } from '../../utils/customError.js';
import fs from 'fs/promises';
import path from 'path';

// Helper to delete local notes file
async function deleteLocalFile(filePath) {
  try {
    const absolutePath = path.resolve(filePath);
    await fs.unlink(absolutePath);
  } catch (error) {
    // If file doesn't exist, we don't crash
    if (error.code !== 'ENOENT') {
      console.error(`Error deleting note file at ${filePath}:`, error);
    }
  }
}

/**
 * Create a new course. Prevents duplicates.
 */
export async function createCourse(courseData) {
  const { name, instructorIds } = courseData;
  
  const existingCourse = await Course.findOne({ name: name.trim() });
  if (existingCourse) {
    throw new CustomError('A course with this name already exists', 409);
  }

  const course = new Course({ name: name.trim(), instructorIds });
  await course.save();
  return course;
}

/**
 * Update a course (Admin only endpoint utility). Prevents name duplicates.
 */
export async function updateCourse(courseId, updateData) {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new CustomError('Course not found', 404);
  }

  if (updateData.name) {
    const existing = await Course.findOne({
      name: updateData.name.trim(),
      _id: { $ne: courseId },
    });
    if (existing) {
      throw new CustomError('A course with this name already exists', 409);
    }
    updateData.name = updateData.name.trim();
  }

  Object.assign(course, updateData);
  await course.save();
  return course;
}

/**
 * Delete a course (Admin only endpoint utility). Blocked if linked to sessions.
 */
export async function deleteCourse(courseId) {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new CustomError('Course not found', 404);
  }

  // Safe deletion check: course cannot be linked to any session
  const linkedSession = await Session.findOne({ courseId });
  if (linkedSession) {
    throw new CustomError('Cannot delete course: it is linked to a session', 400);
  }

  await Course.findByIdAndDelete(courseId);
  return { success: true };
}

/**
 * Get courses assigned to a specific instructor.
 */
export async function getCoursesByInstructor(instructorId) {
  const courses = await Course.find({ instructorIds: instructorId });
  return courses;
}

/**
 * Create a curriculum topic.
 */
export async function createTopic(topicData) {
  const { batchId, title, description, learningObjectives, estimatedHours, notesFiles } = topicData;

  // Enforce orderIndex generation if not provided
  let orderIndex = topicData.orderIndex;
  if (orderIndex === undefined || orderIndex === null) {
    const lastTopic = await Topic.findOne({ batchId }).sort({ orderIndex: -1 });
    orderIndex = lastTopic ? lastTopic.orderIndex + 1 : 0;
  }

  const topic = new Topic({
    batchId,
    title,
    description,
    learningObjectives,
    estimatedHours,
    orderIndex,
    notesFiles: notesFiles || [],
  });

  await topic.save();
  return topic;
}

/**
 * Get curriculum topics for a specific batch, sorted by orderIndex.
 */
export async function getTopicsByBatch(batchId) {
  const topics = await Topic.find({ batchId }).sort({ orderIndex: 1 });
  return topics;
}

/**
 * Update curriculum topic details.
 */
export async function updateTopic(topicId, updateData) {
  const topic = await Topic.findById(topicId);
  if (!topic) {
    throw new CustomError('Topic not found', 404);
  }

  // We should prevent modifying orderIndex directly through general update
  // to avoid order conflicts. Reordering must be done through reorderTopics endpoint.
  delete updateData.orderIndex;
  delete updateData.batchId; // cannot change batch

  Object.assign(topic, updateData);
  await topic.save();
  return topic;
}

/**
 * Delete a topic. Fails if topic is linked to any session.
 */
export async function deleteTopic(topicId) {
  const topic = await Topic.findById(topicId);
  if (!topic) {
    throw new CustomError('Topic not found', 404);
  }

  // Safe deletion check: topic cannot be linked to any session
  const linkedSession = await Session.findOne({ topicIds: topicId });
  if (linkedSession) {
    throw new CustomError('Cannot delete topic: it is linked to a session', 400);
  }

  // Clean up any notes files locally
  if (topic.notesFiles && topic.notesFiles.length > 0) {
    for (const filePath of topic.notesFiles) {
      await deleteLocalFile(filePath);
    }
  }

  await Topic.findByIdAndDelete(topicId);
  return { success: true };
}

/**
 * Reorder topics within a batch atomically.
 */
export async function reorderTopics(topicIds) {
  if (!Array.isArray(topicIds) || topicIds.length === 0) {
    throw new CustomError('Valid array of topic IDs is required for reordering', 400);
  }

  // Fetch topics to verify they exist and belong to the same batch
  const topics = await Topic.find({ _id: { $in: topicIds } });
  if (topics.length !== topicIds.length) {
    throw new CustomError('One or more topic IDs are invalid', 400);
  }

  const batchId = topics[0].batchId;
  const sameBatch = topics.every((t) => t.batchId === batchId);
  if (!sameBatch) {
    throw new CustomError('All topics to reorder must belong to the same batch', 400);
  }

  // To prevent unique index key violations during sequential updates:
  // 1. Temporarily move all affected topic indexes to unique negative values.
  const tempBulkOps = topicIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { orderIndex: -(index + 1) } },
    },
  }));
  await Topic.bulkWrite(tempBulkOps);

  // 2. Safely apply the final positive indexes.
  const finalBulkOps = topicIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { orderIndex: index } },
    },
  }));

  await Topic.bulkWrite(finalBulkOps);
  return { success: true };
}

/**
 * Add note file paths to a topic.
 */
export async function addTopicNotes(topicId, filePaths) {
  const topic = await Topic.findById(topicId);
  if (!topic) {
    // If topic is not found, clean up all uploaded files
    for (const path of filePaths) {
      await deleteLocalFile(path);
    }
    throw new CustomError('Topic not found', 404);
  }

  // Check if adding these files exceeds the limit of 5 files
  const currentCount = topic.notesFiles ? topic.notesFiles.length : 0;
  if (currentCount + filePaths.length > 5) {
    // Clean up uploaded files to avoid orphans
    for (const path of filePaths) {
      await deleteLocalFile(path);
    }
    throw new CustomError('Topics are limited to a maximum of 5 notes files', 400);
  }

  if (!topic.notesFiles) {
    topic.notesFiles = [];
  }

  topic.notesFiles.push(...filePaths);
  await topic.save();
  return topic;
}

/**
 * Delete a specific note file from a topic using its filename.
 */
export async function deleteTopicNoteByFilename(topicId, filename) {
  const topic = await Topic.findById(topicId);
  if (!topic) {
    throw new CustomError('Topic not found', 404);
  }

  // Use path.basename to do platform-independent filename matching
  const filePathToDelete = topic.notesFiles.find(
    (filePath) => path.basename(filePath) === filename
  );

  if (!filePathToDelete) {
    throw new CustomError('Note file not found on this topic', 404);
  }

  const fileIndex = topic.notesFiles.indexOf(filePathToDelete);
  
  // Remove local file from storage
  await deleteLocalFile(filePathToDelete);

  // Remove reference from database notesFiles array
  topic.notesFiles.splice(fileIndex, 1);
  await topic.save();
  return topic;
}
