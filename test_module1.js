import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import * as service from './src/service/curriculumService.js';
import { Topic, Course, Session, Instructor, User } from './src/models/index.js';
import fs from 'fs/promises';
import path from 'path';

// Use a separate test database
const TEST_DB_URI = (process.env.DB_URI || 'mongodb://127.0.0.1:27017/ims') + '_test';

async function runTests() {
  console.log('Connecting to test database:', TEST_DB_URI);
  await connectDatabase(TEST_DB_URI);

  // Clear existing test data
  console.log('Clearing test data...');
  await Topic.deleteMany({});
  await Course.deleteMany({});
  await Session.deleteMany({});
  await Instructor.deleteMany({});
  await User.deleteMany({});

  console.log('\n--- 1. Testing Course Creation ---');
  // Create mock instructor
  const mockUser = new User({
    _id: 'mock-user-uuid',
    email: 'test-inst@example.com',
    mobileNo: '1234567890',
    name: 'Test Instructor User',
    password: 'passwordhash',
    profileStatus: 'Active',
  });
  await mockUser.save();

  const mockInstructor = new Instructor({
    _id: 'mock-instructor-uuid',
    userId: mockUser._id,
  });
  await mockInstructor.save();

  const courseData = {
    name: 'Introduction to Node.js',
    instructorIds: [mockInstructor._id],
  };
  const course = await service.createCourse(courseData);
  console.log('Course created:', course);
  if (course.name !== courseData.name) throw new Error('Course name mismatch');

  // Test duplicate prevention
  try {
    await service.createCourse(courseData);
    throw new Error('Course duplicate creation should have failed');
  } catch (err) {
    console.log('Duplicate course creation check passed (threw expected error):', err.message);
    if (err.statusCode !== 409) {
      throw err;
    }
  }

  console.log('\n--- 2. Testing Listing Courses by Instructor ---');
  const courses = await service.getCoursesByInstructor(mockInstructor._id);
  console.log('Courses found:', courses.length);
  if (courses.length !== 1) throw new Error('Courses list length mismatch');

  console.log('\n--- 3. Testing Topic Creation & Auto-orderIndex ---');
  const topicData1 = {
    batchId: 'test-batch-uuid',
    title: 'Variables and Scopes',
    description: '<p>HTML rich text description of variables</p>',
    learningObjectives: ['Understand let vs var', 'Understand const scoping'],
    estimatedHours: 2.5,
  };
  const topic1 = await service.createTopic(topicData1);
  console.log('Topic 1 created:', topic1);
  if (topic1.orderIndex !== 0) throw new Error('First topic orderIndex must be 0');

  const topicData2 = {
    batchId: 'test-batch-uuid',
    title: 'Functions & Closures',
    description: '<p>HTML rich text description of functions</p>',
    learningObjectives: ['Understand closures', 'Understand arrow functions'],
    estimatedHours: 3.5,
  };
  const topic2 = await service.createTopic(topicData2);
  console.log('Topic 2 created:', topic2);
  if (topic2.orderIndex !== 1) throw new Error('Second topic orderIndex must be 1');

  console.log('\n--- 4. Testing Listing Topics by Batch ---');
  const topics = await service.getTopicsByBatch('test-batch-uuid');
  console.log('Topics in batch:', topics.map(t => `${t.orderIndex}: ${t.title}`));
  if (topics.length !== 2) throw new Error('Topics count mismatch');
  if (topics[0].orderIndex !== 0 || topics[1].orderIndex !== 1) throw new Error('Topics sorting error');

  console.log('\n--- 5. Testing Topic Update ---');
  const updateData = {
    title: 'Updated Topic Title',
    estimatedHours: 4,
  };
  const updatedTopic = await service.updateTopic(topic1._id, updateData);
  console.log('Updated Topic:', updatedTopic);
  if (updatedTopic.title !== updateData.title || updatedTopic.estimatedHours !== updateData.estimatedHours) {
    throw new Error('Topic update failed');
  }

  console.log('\n--- 6. Testing Drag-and-Drop Atomic Reordering ---');
  // Swap order: topic2 first (index 0), topic1 second (index 1)
  console.log('Reordering topic IDs:', [topic2._id, topic1._id]);
  await service.reorderTopics([topic2._id, topic1._id]);
  
  const reorderedTopics = await service.getTopicsByBatch('test-batch-uuid');
  console.log('Reordered topics list:', reorderedTopics.map(t => `${t.orderIndex}: ${t.title}`));
  if (reorderedTopics[0]._id !== topic2._id || reorderedTopics[1]._id !== topic1._id) {
    throw new Error('Reordering failed');
  }

  console.log('\n--- 7. Testing Note Upload and Deletion ---');
  // Ensure storage folder exists
  const notesDir = 'src/uploads/notes';
  await fs.mkdir(notesDir, { recursive: true });

  // Create a dummy note file to simulate local storage
  const dummyFilePath = path.join(notesDir, 'test-note-file.pdf');
  await fs.writeFile(dummyFilePath, 'dummy PDF content');
  console.log('Dummy note file created locally at:', dummyFilePath);

  // Add note
  const topicWithNote = await service.addTopicNotes(topic1._id, [dummyFilePath]);
  console.log('Topic with note added:', topicWithNote);
  if (topicWithNote.notesFiles.length !== 1) throw new Error('Note addition failed');

  // Attempt to delete note (passing the filename only)
  const topicAfterNoteDelete = await service.deleteTopicNoteByFilename(topic1._id, 'test-note-file.pdf');
  console.log('Topic after note delete:', topicAfterNoteDelete);
  if (topicAfterNoteDelete.notesFiles.length !== 0) throw new Error('Note deletion failed');

  // Verify the local file is actually unlinked
  try {
    await fs.access(dummyFilePath);
    throw new Error('Local note file was not deleted from disk');
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    console.log('Note file successfully unlinked from disk.');
  }

  console.log('\n--- 8. Testing Safe Topic Deletion (Blocked when linked to Session) ---');
  // Create another dummy note for topic deletion cleanup verification
  const dummyFilePathForCleanup = path.join(notesDir, 'cleanup-test.docx');
  await fs.writeFile(dummyFilePathForCleanup, 'dummy DOCX content');
  await service.addTopicNotes(topic2._id, [dummyFilePathForCleanup]);

  // Create a session linked to topic2
  const mockSession = new Session({
    _id: 'mock-session-uuid',
    title: 'Test Session Node.js',
    courseId: course._id,
    instructorId: mockInstructor._id,
    topicIds: [topic2._id],
    status: 'scheduled',
  });
  await mockSession.save();
  console.log('Session created linking topic2:', mockSession);

  // Attempt to delete topic2, should throw error
  try {
    await service.deleteTopic(topic2._id);
    throw new Error('Topic deletion succeeded but should have failed (linked to session)');
  } catch (err) {
    console.log('Safe deletion check passed (threw expected error):', err.message);
    if (err.message !== 'Cannot delete topic: it is linked to a session') {
      throw err;
    }
  }

  // Delete session to unlink topic2
  await Session.deleteOne({ _id: mockSession._id });
  console.log('Session deleted (unlinked topic2).');

  // Delete topic2 (should succeed and clean up dummy file)
  const deleteResult = await service.deleteTopic(topic2._id);
  console.log('Topic deletion result:', deleteResult);
  if (!deleteResult.success) throw new Error('Topic deletion failed after unlinking');

  // Verify clean up
  try {
    await fs.access(dummyFilePathForCleanup);
    throw new Error('Cleanup note file was not deleted from disk');
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    console.log('Cleanup file successfully unlinked from disk on topic deletion.');
  }

  console.log('\nALL TESTS PASSED SUCCESSFULLY! ✅');
}

runTests()
  .catch(err => {
    console.error('\nTEST RUN FAILED ❌');
    console.error(err);
  })
  .finally(async () => {
    await disconnectDatabase();
    console.log('Disconnected from database.');
  });
