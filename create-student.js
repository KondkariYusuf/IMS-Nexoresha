import 'dotenv/config';
import mongoose from 'mongoose';
import { Student, User, Batch } from './src/models/index.js';

async function createStudent() {
  try {
    const dbUri = process.env.DB_URI;
    if (!dbUri) {
      throw new Error('DB_URI not found in .env');
    }

    mongoose.set('strictQuery', true);
    await mongoose.connect(dbUri);
    console.log('Connected to MongoDB');

    // Check if batch exists, if not create one
    let batch = await Batch.findOne({ name: 'Batch-2024' });
    if (!batch) {
      batch = await Batch.create({
        name: 'Batch-2024',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });
      console.log('Created batch:', batch._id);
    }

    // Create student
    const studentData = {
      enrollementNo: 'STU-001',
      dob: new Date('2000-05-15'),
      gender: 'Male',
      educationQualification: 'Bachelor of Technology',
      instituteName: 'Tech University',
      batchId: batch._id,
      gitHubUrl: 'https://github.com/student001',
      linkedInUrl: 'https://linkedin.com/in/student001',
    };

    const student = await Student.create(studentData);
    console.log('✅ Student created successfully:');
    console.log(JSON.stringify(student, null, 2));

    // Create corresponding user record
    const userData = {
      _id: student._id,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'student',
      currentMarks: 0,
    };

    const user = await User.create(userData);
    console.log('✅ User created successfully:');
    console.log(JSON.stringify(user, null, 2));

    console.log('\n📝 Student ID:', student._id);
    console.log('📝 Enrollment No:', student.enrollementNo);

  } catch (error) {
    console.error('❌ Error creating student:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

createStudent();
