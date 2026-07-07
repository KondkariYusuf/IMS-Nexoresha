import 'dotenv/config';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import {
  Assignment,
  AssignmentResult,
  AssignmentSubmission,
  Attendance,
  Batch,
  Course,
  Instructor,
  Permission,
  Quiz,
  QuizResult,
  Role,
  Session,
  SessionFeedback,
  Student,
  StudentLedger,
  StudentMetrics,
  User,
} from '../src/models/index.js';

const resetCollections = process.argv.includes('--reset');

const seed = async () => {
  await connectDatabase();

  try {
    if (resetCollections) {
      await Promise.all([
        Permission.deleteMany({}),
        Role.deleteMany({}),
        User.deleteMany({}),
        Batch.deleteMany({}),
        Student.deleteMany({}),
        Instructor.deleteMany({}),
        Course.deleteMany({}),
        Session.deleteMany({}),
        SessionFeedback.deleteMany({}),
        Attendance.deleteMany({}),
        Assignment.deleteMany({}),
        AssignmentSubmission.deleteMany({}),
        AssignmentResult.deleteMany({}),
        Quiz.deleteMany({}),
        QuizResult.deleteMany({}),
        StudentLedger.deleteMany({}),
        StudentMetrics.deleteMany({}),
      ]);
    }

    const permissions = await Permission.insertMany([
      {
        method: 'GET',
        base_url: '/api',
        path: '/health',
        action_name: 'view_health',
        description: 'View system health endpoint',
      },
      {
        method: 'POST',
        base_url: '/api',
        path: '/users',
        action_name: 'create_user',
        description: 'Create a user account',
      },
      {
        method: 'GET',
        base_url: '/api',
        path: '/students',
        action_name: 'view_students',
        description: 'View student records',
      },
      {
        method: 'POST',
        base_url: '/api',
        path: '/sessions',
        action_name: 'create_session',
        description: 'Create a learning session',
      },
      {
        method: 'POST',
        base_url: '/api',
        path: '/assignments',
        action_name: 'create_assignment',
        description: 'Create an assignment',
      },
    ]);

    const permissionIds = permissions.map((permission) => permission._id.toString());

    const roles = await Role.insertMany([
      {
        name: 'Admin',
        description: 'Platform administrator with full access',
        permissionIds: permissionIds.slice(0, 3),
      },
      {
        name: 'Instructor',
        description: 'Course instructor with teaching access',
        permissionIds: permissionIds.slice(2, 5),
      },
      {
        name: 'Student',
        description: 'Learner with limited access',
        permissionIds: [permissionIds[0], permissionIds[2]],
      },
    ]);

    const adminRoleId = roles.find((role) => role.name === 'Admin')._id.toString();
    const instructorRoleId = roles.find((role) => role.name === 'Instructor')._id.toString();
    const studentRoleId = roles.find((role) => role.name === 'Student')._id.toString();

    const adminUser = (
      await User.insertMany([
        {
          email: 'admin@ims-nexoresha.com',
          mobileNo: '+2348000000001',
          name: 'Aisha Okafor',
          password: 'Admin@123',
          roleId: adminRoleId,
          profileStatus: 'Active',
          tokenVersion: 0,
        },
      ])
    )[0];

    const instructorUsers = await User.insertMany([
      {
        email: 'maria.adesuwa@ims-nexoresha.com',
        mobileNo: '+2348000000002',
        name: 'Maria Adesuwa',
        password: 'Instructor@123',
        roleId: instructorRoleId,
        created_by: adminUser._id.toString(),
        profileStatus: 'Active',
        tokenVersion: 1,
      },
      {
        email: 'david.owusu@ims-nexoresha.com',
        mobileNo: '+2348000000003',
        name: 'David Owusu',
        password: 'Instructor@123',
        roleId: instructorRoleId,
        created_by: adminUser._id.toString(),
        profileStatus: 'Active',
        tokenVersion: 1,
      },
    ]);

    const studentUsers = await User.insertMany([
      {
        email: 'tunde.balogun@ims-nexoresha.com',
        mobileNo: '+2348000000004',
        name: 'Tunde Balogun',
        password: 'Student@123',
        roleId: studentRoleId,
        created_by: adminUser._id.toString(),
        profileStatus: 'Active',
        tokenVersion: 0,
      },
      {
        email: 'fola.akin@ims-nexoresha.com',
        mobileNo: '+2348000000005',
        name: 'Fola Akin',
        password: 'Student@123',
        roleId: studentRoleId,
        created_by: adminUser._id.toString(),
        profileStatus: 'Active',
        tokenVersion: 0,
      },
      {
        email: 'grace.mensah@ims-nexoresha.com',
        mobileNo: '+2348000000006',
        name: 'Grace Mensah',
        password: 'Student@123',
        roleId: studentRoleId,
        created_by: adminUser._id.toString(),
        profileStatus: 'Active',
        tokenVersion: 0,
      },
    ]);

    const batches = await Batch.insertMany([
      {
        name: 'Web Development Cohort 1',
        startDate: new Date('2025-01-15T00:00:00.000Z'),
        endDate: new Date('2025-06-15T00:00:00.000Z'),
        status: 'completed',
      },
      {
        name: 'Data Science Cohort 2',
        startDate: new Date('2025-07-01T00:00:00.000Z'),
        endDate: new Date('2025-11-30T00:00:00.000Z'),
        status: 'ongoing',
      },
    ]);

    const instructors = await Instructor.insertMany([
      {
        userId: instructorUsers[0]._id.toString(),
        linkedInUrl: 'https://www.linkedin.com/in/mariaadesuwa',
        ratingSum: 45,
        ratingCount: 10,
      },
      {
        userId: instructorUsers[1]._id.toString(),
        linkedInUrl: 'https://www.linkedin.com/in/davidowusu',
        ratingSum: 40,
        ratingCount: 8,
      },
    ]);

    const students = await Student.insertMany([
      {
        enrollementNo: 'S001',
        userId: studentUsers[0]._id.toString(),
        educationQualification: 'BSc Computer Science',
        dob: new Date('2000-05-14T00:00:00.000Z'),
        gender: 'Female',
        instituteName: 'University of Lagos',
        batchId: batches[0]._id.toString(),
        currentStreak: 5,
        maxStreak: 8,
        totalPoints: 140,
        gitHubUrl: 'https://github.com/tundebalogun',
        linkedInUrl: 'https://linkedin.com/in/tundebalogun',
        enrolledCourseIds: [],
      },
      {
        enrollementNo: 'S002',
        userId: studentUsers[1]._id.toString(),
        educationQualification: 'HND Software Engineering',
        dob: new Date('1999-11-02T00:00:00.000Z'),
        gender: 'Male',
        instituteName: 'Federal Polytechnic',
        batchId: batches[0]._id.toString(),
        currentStreak: 3,
        maxStreak: 6,
        totalPoints: 120,
        gitHubUrl: 'https://github.com/foak',
        linkedInUrl: 'https://linkedin.com/in/foak',
        enrolledCourseIds: [],
      },
      {
        enrollementNo: 'S003',
        userId: studentUsers[2]._id.toString(),
        educationQualification: 'BEng Electrical Engineering',
        dob: new Date('2001-02-20T00:00:00.000Z'),
        gender: 'Female',
        instituteName: 'KNUST',
        batchId: batches[1]._id.toString(),
        currentStreak: 4,
        maxStreak: 7,
        totalPoints: 160,
        gitHubUrl: 'https://github.com/gracemensah',
        linkedInUrl: 'https://linkedin.com/in/gracemensah',
        enrolledCourseIds: [],
      },
    ]);

    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Seed failed', error);
  } finally {
    await disconnectDatabase();
  }
};

seed();
