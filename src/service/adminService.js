import { User, Student } from '../models/index.js';
import { CustomError } from '../../utils/customError.js';
import bcrypt from 'bcrypt';

class AdminService {
    async createStudent(studentData) {
        const { name, email, password, batchId } = studentData;

        // Check if email already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            throw new CustomError('Email already exists', 400);
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            mobileNo: `${Date.now()}`,
            profileStatus: 'Active',
        });
        // Create Student
        const student = await Student.create({
            userId: user._id,
            batchId: batchId || null,
        });

        const { password: _, ...safeUser } = user.toObject();

        return {
            message: 'Student created successfully',
            user: safeUser,
            student,
        };

    }
    async getStudents() {
        const students = await Student.find().populate({
            path: 'userId',
            select: '-password',
        });

        return {
            message: 'Students fetched successfully',
            students,
        };
    }
    async getStudentById(studentId) {
        const student = await Student.findOne({ _id: studentId }).populate({
            path: 'userId',
            select: '-password',
        });

        if (!student) {
            throw new CustomError('Student not found', 404);
        }

        return {
            message: 'Student fetched successfully',
            student,
        };
    }
    async updateStudent(studentId, studentData) {
        const student = await Student.findById(studentId);

        if (!student) {
            throw new CustomError('Student not found', 404);
        }

        const user = await User.findById(student.userId);

        if (!user) {
            throw new CustomError('User not found', 404);
        }

        if (studentData.name) {
            user.name = studentData.name;
        }

        if (studentData.email) {
            const existingUser = await User.findOne({
                email: studentData.email,
                _id: { $ne: user._id },
            });

            if (existingUser) {
                throw new CustomError('Email already exists', 400);
            }

            user.email = studentData.email;
        }

        if (studentData.batchId !== undefined) {
            student.batchId = studentData.batchId;
        }

        await user.save();
        await student.save();

        return {
            message: 'Student updated successfully',
            student: await Student.findById(studentId).populate({
                path: 'userId',
                select: '-password',
            }),
        };
    }
    async updateStudentStatus(studentId, profileStatus) {
        const student = await Student.findById(studentId);

        if (!student) {
            throw new CustomError('Student not found', 404);
        }

        const user = await User.findById(student.userId);

        if (!user) {
            throw new CustomError('User not found', 404);
        }

        user.profileStatus = profileStatus;

        await user.save();

        return {
            message: `Student ${profileStatus.toLowerCase()} successfully`,
            student: await Student.findById(studentId).populate({
                path: 'userId',
                select: '-password',
            }),
        };
    }
    async updateStudentStatus(studentId, profileStatus) {
        const student = await Student.findById(studentId);

        if (!student) {
            throw new CustomError('Student not found', 404);
        }

        const user = await User.findById(student.userId);

        if (!user) {
            throw new CustomError('User not found', 404);
        }

        const allowedStatus = ['Active', 'Inactive', 'blocked'];

        if (!allowedStatus.includes(profileStatus)) {
            throw new CustomError('Invalid profile status', 400);
        }

        // Then update the status
        user.profileStatus = profileStatus;

        await user.save();

        return {
            message: `Student ${profileStatus.toLowerCase()} successfully`,
            student: await Student.findById(studentId).populate({
                path: 'userId',
                select: '-password',
            }),
        };
    }
}
export default new AdminService();