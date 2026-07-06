import 'dotenv/config';
import { connectDatabase, disconnectDatabase } from './config/database.js';
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
} from './src/models/index.js';

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

    const courses = await Course.insertMany([
      {
        name: 'Full-Stack Web Development',
        instructorIds: [instructors[0]._id.toString(), instructors[1]._id.toString()],
      },
      {
        name: 'Data Analytics with Python',
        instructorIds: [instructors[1]._id.toString()],
      },
    ]);

    const courseIds = courses.map((course) => course._id.toString());
    await Student.updateMany(
      {},
      { $set: { enrolledCourseIds: courseIds.slice(0, 2) } },
    );

    const sessions = await Session.insertMany([
      {
        title: 'Introduction to REST APIs',
        notes: 'Covered CRUD concepts and Postman testing.',
        recordingUrl: 'https://example.com/recordings/api-intro',
        courseId: courseIds[0],
        instructorId: instructors[0]._id.toString(),
        meetUrl: 'https://meet.google.com/abc-defg-hij',
        sessionDateAndTime: new Date('2025-02-01T10:00:00.000Z'),
        duration: '90 mins',
        status: 'completed',
        createdBy: adminUser._id.toString(),
      },
      {
        title: 'Data Cleaning with Pandas',
        notes: 'Discussed missing values, joins, and data validation.',
        recordingUrl: 'https://example.com/recordings/pandas',
        courseId: courseIds[1],
        instructorId: instructors[1]._id.toString(),
        meetUrl: 'https://meet.google.com/klm-nopq-rst',
        sessionDateAndTime: new Date('2025-07-10T14:00:00.000Z'),
        duration: '120 mins',
        status: 'live',
        createdBy: adminUser._id.toString(),
      },
      {
        title: 'Frontend State Management',
        notes: 'Explored React state and context APIs.',
        recordingUrl: 'https://example.com/recordings/react-state',
        courseId: courseIds[0],
        instructorId: instructors[0]._id.toString(),
        meetUrl: 'https://meet.google.com/xyz-1234-abc',
        sessionDateAndTime: new Date('2025-03-08T16:00:00.000Z'),
        duration: '75 mins',
        status: 'scheduled',
        createdBy: adminUser._id.toString(),
      },
    ]);

    const assignments = await Assignment.insertMany([
      {
        title: 'Build a RESTful API',
        sessionId: sessions[0]._id.toString(),
        prompt: 'Create a Node.js API with CRUD operations and validate input.',
        submissionDeadline: new Date('2025-02-15T23:59:59.000Z'),
        attachments: 'https://example.com/attachments/api-assignment.pdf',
        instructions: 'Submit a GitHub repository link and include a README.',
        task: 'Implement the API and document the endpoints.',
        createdBy: adminUser._id.toString(),
      },
      {
        title: 'Data Analysis Notebook',
        sessionId: sessions[1]._id.toString(),
        prompt: 'Clean a public dataset and summarize insights in a notebook.',
        submissionDeadline: new Date('2025-07-20T23:59:59.000Z'),
        attachments: 'https://example.com/attachments/data-analysis.zip',
        instructions: 'Include charts and a short reflection.',
        task: 'Prepare the notebook and share the output.',
        createdBy: adminUser._id.toString(),
      },
    ]);

    const quizzes = await Quiz.insertMany([
      {
        title: 'API Fundamentals Quiz',
        sessionId: sessions[0]._id.toString(),
        link: 'https://example.com/quizzes/api-fundamentals',
        submissionDeadline: new Date('2025-02-10T23:59:59.000Z'),
        totalMarks: '20',
        passingMarks: '10',
        totaldurationInMins: 25,
        createdBy: adminUser._id.toString(),
      },
      {
        title: 'Pandas Basics Quiz',
        sessionId: sessions[1]._id.toString(),
        link: 'https://example.com/quizzes/pandas-basics',
        submissionDeadline: new Date('2025-07-15T23:59:59.000Z'),
        totalMarks: '25',
        passingMarks: '13',
        totaldurationInMins: 20,
        createdBy: adminUser._id.toString(),
      },
    ]);

    const attendanceRecords = await Attendance.insertMany([
      {
        studentId: students[0]._id.toString(),
        courseId: courseIds[0],
        sessionId: sessions[0]._id.toString(),
        status: 'present',
        markedBy: adminUser._id.toString(),
        markedAt: new Date('2025-02-01T10:30:00.000Z'),
      },
      {
        studentId: students[1]._id.toString(),
        courseId: courseIds[0],
        sessionId: sessions[0]._id.toString(),
        status: 'absent',
        markedBy: adminUser._id.toString(),
        markedAt: new Date('2025-02-01T10:30:00.000Z'),
      },
      {
        studentId: students[2]._id.toString(),
        courseId: courseIds[1],
        sessionId: sessions[1]._id.toString(),
        status: 'half',
        markedBy: adminUser._id.toString(),
        markedAt: new Date('2025-07-10T14:30:00.000Z'),
      },
    ]);

    const sessionFeedback = await SessionFeedback.insertMany([
      {
        studentId: students[0]._id.toString(),
        feedbackType: 'session',
        feedbackTypeId: sessions[0]._id.toString(),
        avgRating: 4.8,
        feedback: 'The session was clear and highly practical.',
      },
      {
        studentId: students[1]._id.toString(),
        feedbackType: 'instructor',
        feedbackTypeId: instructors[0]._id.toString(),
        avgRating: 4.3,
        feedback: 'The instructor explained complex topics in a simple way.',
      },
      {
        studentId: students[2]._id.toString(),
        feedbackType: 'session',
        feedbackTypeId: sessions[1]._id.toString(),
        avgRating: 4.6,
        feedback: 'The examples were relevant and engaging.',
      },
    ]);

    const submissions = await AssignmentSubmission.insertMany([
      {
        studentId: students[0]._id.toString(),
        assignmentId: assignments[0]._id.toString(),
        gitSubmissionLink: 'https://github.com/tunde/api-assignment',
        repoName: 'api-assignment',
        branchName: 'main',
        remarks: 'Delivered on time with tests',
        submittedAt: new Date('2025-02-14T21:30:00.000Z'),
        onTimeSubmission: true,
      },
      {
        studentId: students[1]._id.toString(),
        assignmentId: assignments[0]._id.toString(),
        gitSubmissionLink: 'https://github.com/foak/api-assignment',
        repoName: 'api-assignment',
        branchName: 'feature/assignment',
        remarks: 'Submission included a basic README',
        submittedAt: new Date('2025-02-15T22:00:00.000Z'),
        onTimeSubmission: true,
      },
      {
        studentId: students[2]._id.toString(),
        assignmentId: assignments[1]._id.toString(),
        gitSubmissionLink: 'https://github.com/grace/data-analysis-notebook',
        repoName: 'data-analysis-notebook',
        branchName: 'main',
        remarks: 'Notebook contains clear visualizations',
        submittedAt: new Date('2025-07-18T20:45:00.000Z'),
        onTimeSubmission: false,
      },
    ]);

    await AssignmentResult.insertMany([
      {
        submissionId: submissions[0]._id.toString(),
        parameters: { completeness: 95, clarity: 90 },
        totalMarks: 100,
        marksObtained: 92,
        percentage: 92,
        points: 18,
        bonusPoints: 2,
        totalPoints: 20,
        feedback: 'Excellent implementation and clear documentation.',
        codeQualityScore: 91,
        evalBy: instructors[0]._id.toString(),
        evalAt: new Date('2025-02-16T10:00:00.000Z'),
        result: 'pass',
      },
      {
        submissionId: submissions[1]._id.toString(),
        parameters: { completeness: 84, clarity: 78 },
        totalMarks: 100,
        marksObtained: 81,
        percentage: 81,
        points: 16,
        bonusPoints: 0,
        totalPoints: 16,
        feedback: 'Good structure but needs more validation.',
        codeQualityScore: 80,
        evalBy: instructors[0]._id.toString(),
        evalAt: new Date('2025-02-17T12:30:00.000Z'),
        result: 'pass',
      },
      {
        submissionId: submissions[2]._id.toString(),
        parameters: { completeness: 88, clarity: 86 },
        totalMarks: 100,
        marksObtained: 87,
        percentage: 87,
        points: 17,
        bonusPoints: 1,
        totalPoints: 18,
        feedback: 'Strong analysis and clear visuals.',
        codeQualityScore: 88,
        evalBy: instructors[1]._id.toString(),
        evalAt: new Date('2025-07-19T09:00:00.000Z'),
        result: 'pass',
      },
    ]);

    await QuizResult.insertMany([
      {
        studentId: students[0]._id.toString(),
        quizId: quizzes[0]._id.toString(),
        totalMarks: 20,
        marksObtained: 17,
        percentage: 85,
        points: 8,
        bonusPoints: 1,
        totalPoints: 9,
        timeTakenInMins: 18,
        submittedAt: new Date('2025-02-10T22:15:00.000Z'),
        feedback: 'Great grasp of API fundamentals',
        result: 'pass',
      },
      {
        studentId: students[1]._id.toString(),
        quizId: quizzes[0]._id.toString(),
        totalMarks: 20,
        marksObtained: 12,
        percentage: 60,
        points: 6,
        bonusPoints: 0,
        totalPoints: 6,
        timeTakenInMins: 23,
        submittedAt: new Date('2025-02-10T22:30:00.000Z'),
        feedback: 'Needs more revision on REST verbs',
        result: 'failed',
      },
      {
        studentId: students[2]._id.toString(),
        quizId: quizzes[1]._id.toString(),
        totalMarks: 25,
        marksObtained: 21,
        percentage: 84,
        points: 10,
        bonusPoints: 2,
        totalPoints: 12,
        timeTakenInMins: 15,
        submittedAt: new Date('2025-07-15T21:40:00.000Z'),
        feedback: 'Excellent performance in data cleaning',
        result: 'pass',
      },
    ]);

    await StudentLedger.insertMany([
      {
        studentId: students[0]._id.toString(),
        sourceType: 'assignment',
        sourceId: submissions[0]._id.toString(),
        points: 20,
        description: 'Points awarded for the REST API assignment',
      },
      {
        studentId: students[1]._id.toString(),
        sourceType: 'quiz',
        sourceId: quizzes[0]._id.toString(),
        points: 6,
        description: 'Points earned from the API fundamentals quiz',
      },
      {
        studentId: students[2]._id.toString(),
        sourceType: 'attendance',
        sourceId: attendanceRecords[2]._id.toString(),
        points: 2,
        description: 'Attendance points for the live session',
      },
    ]);

    await StudentMetrics.insertMany([
      {
        studentId: students[0]._id.toString(),
        totalPoints: 160,
        attendancePercentage: 100,
        assignmentAvgScore: 92,
        quizAvgScore: 85,
        rank: 1,
        percentile: 95,
        assignmentSubmitted: 1,
        totalAssignments: 2,
        quizCompleted: 1,
        totalQuiz: 2,
        sessionAttended: 1,
        totalSession: 3,
      },
      {
        studentId: students[1]._id.toString(),
        totalPoints: 126,
        attendancePercentage: 67,
        assignmentAvgScore: 81,
        quizAvgScore: 60,
        rank: 3,
        percentile: 40,
        assignmentSubmitted: 1,
        totalAssignments: 2,
        quizCompleted: 1,
        totalQuiz: 2,
        sessionAttended: 1,
        totalSession: 3,
      },
      {
        studentId: students[2]._id.toString(),
        totalPoints: 178,
        attendancePercentage: 83,
        assignmentAvgScore: 87,
        quizAvgScore: 84,
        rank: 2,
        percentile: 70,
        assignmentSubmitted: 1,
        totalAssignments: 2,
        quizCompleted: 1,
        totalQuiz: 2,
        sessionAttended: 1,
        totalSession: 3,
      },
    ]);

    console.log('Seed data inserted successfully.');
  } finally {
    await disconnectDatabase();
  }
};

seed().catch((error) => {
  console.error('Seed process failed:', error);
  process.exitCode = 1;
});
