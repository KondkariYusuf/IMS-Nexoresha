const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const { Student, Course, Batch } = require('./src/models/index.js');

mongoose.connect(process.env.DB_URI).then(async () => {
    // Get all courses belonging to batch '6e542215-3c4b-4f44-b3f6-80ff29e2fb5a'
    const courses = await Course.find({ batchId: '6e542215-3c4b-4f44-b3f6-80ff29e2fb5a' }).lean();
    const courseIds = courses.map(c => c._id);
    console.log('Courses for batch:', courseIds);

    // Update student's enrolledCourseIds
    const student = await Student.findOne({ userId: 'ef4fc415-439b-4d06-b471-fde1848b4f0f' });
    if (student) {
        student.enrolledCourseIds = courseIds;
        await student.save();
        console.log('Updated student enrolledCourseIds to:', student.enrolledCourseIds);
    }

    // Update batch's courseId to the first courseId if available
    const batch = await Batch.findById('6e542215-3c4b-4f44-b3f6-80ff29e2fb5a');
    if (batch && courseIds.length > 0) {
        batch.courseId = courseIds[0];
        await batch.save();
        console.log('Updated batch courseId to:', batch.courseId);
    }

    process.exit(0);
}).catch(console.error);
