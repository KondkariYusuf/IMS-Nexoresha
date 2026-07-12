import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

import { User, Role, Instructor, Course, Batch, Session } from './models/index.js';

dotenv.config();

const seedTeacher = async () => {
    try {
        await mongoose.connect(process.env.DB_URI);
        console.log('Connected to MongoDB');

        // 1. Get/Create Teacher Role
        let teacherRole = await Role.findOne({ name: { $regex: /^teacher$/i } });

        if (!teacherRole) {
            teacherRole = await Role.create({
                name: 'teacher',
                description: 'Teacher role',
            });
            console.log('Teacher role created');
        }

        // 2. Get/Create Teacher User
        let user = await User.findOne({ email: 'teacher@example.com' });
        let instructor;

        if (!user) {
            const hashedPassword = await bcrypt.hash('Teacher@123', 10);
            user = await User.create({
                name: 'Teacher User',
                email: 'teacher@example.com',
                mobileNo: '9876543210',
                password: hashedPassword,
                roleId: teacherRole._id,
                profileStatus: 'Active',
            });
            console.log('Teacher User created');
        } else {
            console.log('Teacher User already exists');
        }

        // 3. Get/Create Instructor Profile
        instructor = await Instructor.findOne({ userId: user._id });

        if (!instructor) {
            instructor = await Instructor.create({
                userId: user._id,
                designation: 'Teacher',
                bio: 'System teacher user',
            });
            console.log('Instructor profile created');
        } else {
            console.log('Instructor profile already exists');
        }

        // 4. Link Instructor to all existing Courses using updateOne to bypass schema validations on existing mock data
        const courses = await Course.find({});
        for (const course of courses) {
            await Course.updateOne(
                { _id: course._id },
                { $addToSet: { instructorIds: instructor._id } }
            );
            console.log(`Linked instructor to course: ${course.name}`);
        }

        // 5. Link Instructor to all existing Batches
        const batches = await Batch.find({});
        const batchIds = batches.map(b => b._id);
        
        await Instructor.updateOne(
            { _id: instructor._id },
            { $addToSet: { assignedBatches: { $each: batchIds } } }
        );
        console.log('Assigned batches to instructor profile');

        for (const batch of batches) {
            await Batch.updateOne(
                { _id: batch._id },
                { $addToSet: { teacherIds: instructor._id } }
            );
            console.log(`Linked instructor to batch: ${batch.name}`);
        }

        // 6. Link Instructor to all existing Sessions (Lectures)
        const result = await Session.updateMany(
            { $or: [{ instructorId: null }, { instructorId: '' }, { instructorId: { $exists: false } }] },
            { $set: { instructorId: instructor._id } }
        );
        if (result.modifiedCount > 0) {
            console.log(`Updated ${result.modifiedCount} sessions with instructorId`);
        }

        console.log('Teacher seed and data associations completed successfully.');
        console.log('Email: teacher@example.com');
        console.log('Password: Teacher@123');

        process.exit(0);
    } catch (error) {
        console.error('Seed teacher failed:', error);
        process.exit(1);
    }
};

seedTeacher();
