import 'dotenv/config';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { User, Instructor, Batch, Course } from './src/models/index.js';

async function seedData() {
  console.log('Connecting to database:', process.env.DB_URI);
  await connectDatabase(process.env.DB_URI);

  // 1. Create Mock User (Instructor Role)
  const existingUser = await User.findById('mock-instructor-user-id');
  if (!existingUser) {
    const mockUser = new User({
      _id: 'mock-instructor-user-id',
      email: 'instructor@example.com',
      mobileNo: '9876543210',
      name: 'John Doe (Instructor)',
      password: 'hashedpassword',
      profileStatus: 'Active',
      tokenVersion: 0,
    });
    await mockUser.save();
    console.log('Created Mock User (John Doe)');
  } else {
    console.log('Mock User already exists.');
  }

  // 2. Create Mock Instructor profile
  const existingInstructor = await Instructor.findById('mock-instructor-uuid');
  if (!existingInstructor) {
    const mockInstructor = new Instructor({
      _id: 'mock-instructor-uuid',
      userId: 'mock-instructor-user-id',
      linkedInUrl: 'https://linkedin.com/in/johndoe',
      ratingSum: 5,
      ratingCount: 1,
    });
    await mockInstructor.save();
    console.log('Created Mock Instructor profile');
  } else {
    console.log('Mock Instructor profile already exists.');
  }

  // 3. Create Mock Batch
  const existingBatch = await Batch.findById('mock-batch-uuid');
  if (!existingBatch) {
    const mockBatch = new Batch({
      _id: 'mock-batch-uuid',
      name: 'MERN Stack Cohort 1',
      status: 'ongoing',
    });
    await mockBatch.save();
    console.log('Created Mock Batch (Cohort 1)');
  } else {
    console.log('Mock Batch already exists.');
  }

  // 4. Create Mock Course linked to Instructor
  const existingCourse = await Course.findById('mock-course-uuid');
  if (!existingCourse) {
    const mockCourse = new Course({
      _id: 'mock-course-uuid',
      name: 'Node.js Backend Development',
      instructorIds: ['mock-instructor-uuid'],
    });
    await mockCourse.save();
    console.log('Created Mock Course linked to Instructor');
  } else {
    console.log('Mock Course already exists.');
  }

  console.log('\nDatabase seeding finished successfully! ✅');
}

seedData()
  .catch(err => {
    console.error('Seeding failed:', err);
  })
  .finally(async () => {
    await disconnectDatabase();
    console.log('Disconnected from database.');
  });
