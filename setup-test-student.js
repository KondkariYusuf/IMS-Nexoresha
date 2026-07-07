import 'dotenv/config';
import mongoose from 'mongoose';
import { Student, User, Batch } from './src/models/index.js';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);

async function setupTestStudent() {
  try {
    const dbUri = process.env.DB_URI;
    if (!dbUri) {
      throw new Error('DB_URI not found in .env');
    }

    mongoose.set('strictQuery', true);
    await mongoose.connect(dbUri);
    console.log('✅ Connected to MongoDB\n');

    // Check if test batch exists
    let batch = await Batch.findOne({ name: 'TestBatch-2024' });
    if (!batch) {
      batch = await Batch.create({
        name: 'TestBatch-2024',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'ongoing',
      });
      console.log('✅ Created test batch:', batch._id);
    } else {
      console.log('✅ Test batch exists:', batch._id);
    }

    // Check if student already exists
    let student = await Student.findOne({ enrollementNo: 'TEST-STU-001' });
    
    if (!student) {
      // Create new student
      student = await Student.create({
        enrollementNo: 'TEST-STU-001',
        dob: new Date('2000-05-15'),
        gender: 'Male',
        educationQualification: 'Bachelor of Technology',
        instituteName: 'Tech University',
        batchId: batch._id,
        gitHubUrl: 'https://github.com/teststudent001',
        linkedInUrl: 'https://linkedin.com/in/teststudent001',
      });
      console.log('✅ Created new student\n');
    } else {
      console.log('✅ Student already exists\n');
    }

    // Create or update user record
    let user = await User.findById(student._id);
    if (!user) {
      user = await User.create({
        _id: student._id,
        name: 'Test Student',
        email: 'teststudent@example.com',
        mobileNo: '+91-9999999999',
        password: 'TestPassword123!',
        profileStatus: 'Active',
        tokenVersion: 0,
      });
      console.log('✅ Created user record\n');
    }

    console.log('═══════════════════════════════════════');
    console.log('📝 STUDENT DETAILS FOR POSTMAN:');
    console.log('═══════════════════════════════════════');
    console.log(`Student ID (use this in API calls):`);
    console.log(`${student._id}`);
    console.log('');
    console.log(`Enrollment No: TEST-STU-001`);
    console.log(`Name: Test Student`);
    console.log(`Email: teststudent@example.com`);
    console.log('═══════════════════════════════════════\n');

    console.log('📌 Use this in Postman queries:');
    console.log(`?studentId=${student._id}\n`);

    console.log('Example API calls:');
    console.log(`GET http://localhost:4000/api/student/dashboard?studentId=${student._id}`);
    console.log(`GET http://localhost:4000/api/student/profile?studentId=${student._id}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

setupTestStudent();
