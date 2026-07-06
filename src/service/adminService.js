import {
    User,
    Student,
    Batch,
    BatchConfig,
    Instructor,
} from '../models/index.js';
import { CustomError } from '../../utils/customError.js';
import { v4 as uuidv4 } from 'uuid';
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
    async createBatch(batchData) {
        const {
            name,
            description,
            startDate,
            endDate,
            teacherIds,
            studentIds,
        } = batchData;

        const existingBatch = await Batch.findOne({ name });

        if (existingBatch) {
            throw new CustomError('Batch already exists', 400);
        }

        const batch = await Batch.create({
            name,
            description: description || '',
            startDate: startDate || null,
            endDate: endDate || null,
            teacherIds: teacherIds || [],
            studentIds: studentIds || [],
        });

        return {
            message: 'Batch created successfully',
            batch,
        };
    }
    async getBatches() {
        const batches = await Batch.find();

        return {
            message: 'Batches fetched successfully',
            batches,
        };
    }
    async getBatchById(batchId) {
        const batch = await Batch.findById(batchId);

        if (!batch) {
            throw new CustomError('Batch not found', 404);
        }

        return {
            message: 'Batch fetched successfully',
            batch,
        };
    }
    async updateBatch(batchId, batchData) {
        const batch = await Batch.findById(batchId);

        if (!batch) {
            throw new CustomError('Batch not found', 404);
        }

        if (batchData.name) batch.name = batchData.name;
        if (batchData.description !== undefined) batch.description = batchData.description;
        if (batchData.startDate !== undefined) batch.startDate = batchData.startDate || null;
        if (batchData.endDate !== undefined) batch.endDate = batchData.endDate || null;
        if (batchData.teacherIds !== undefined) batch.teacherIds = batchData.teacherIds;
        if (batchData.studentIds !== undefined) batch.studentIds = batchData.studentIds;

        await batch.save();

        return {
            message: 'Batch updated successfully',
            batch,
        };
    }
    async deleteBatch(batchId) {
        const batch = await Batch.findById(batchId);

        if (!batch) {
            throw new CustomError('Batch not found', 404);
        }

        await batch.deleteOne();

        return {
            message: 'Batch deleted successfully',
        };
    }
    async updateBatchStatus(batchId, status) {
        const allowedStatus = ['upcoming', 'ongoing', 'completed'];

        if (!allowedStatus.includes(status)) {
            throw new CustomError('Invalid batch status', 400);
        }

        const batch = await Batch.findById(batchId);

        if (!batch) {
            throw new CustomError('Batch not found', 404);
        }

        batch.status = status;
        await batch.save();

        return {
            message: 'Batch status updated successfully',
            batch,
        };
    }
    async closeBatch(batchId) {
        const batch = await Batch.findById(batchId);

        if (!batch) {
            throw new CustomError('Batch not found', 404);
        }

        batch.status = 'completed';

        await batch.save();

        return {
            message: 'Batch closed successfully',
            batch,
        };
    }
    async generateRecruiterLink(batchId) {
        const batch = await Batch.findById(batchId);

        if (!batch) {
            throw new CustomError('Batch not found', 404);
        }

        batch.recruiterUuid = uuidv4();
        batch.recruiterLinkActive = true;

        await batch.save();

        return {
            message: 'Recruiter link generated successfully',
            recruiterUuid: batch.recruiterUuid,
        };
    }
    async revokeRecruiterLink(batchId) {
        const batch = await Batch.findById(batchId);

        if (!batch) {
            throw new CustomError('Batch not found', 404);
        }

        batch.recruiterUuid = null;
        batch.recruiterLinkActive = false;

        await batch.save();

        return {
            message: 'Recruiter link revoked successfully',
        };
    }
    async getBatchConfig(batchId) {
        const batch = await Batch.findById(batchId);

        if (!batch) {
            throw new CustomError('Batch not found', 404);
        }

        let batchConfig = await BatchConfig.findOne({ batchId });

        if (!batchConfig) {
            batchConfig = await BatchConfig.create({ batchId });
        }

        return {
            message: 'Batch config fetched successfully',
            batchConfig,
        };
    }
    async updateBatchConfig(batchId, configData) {
        const batch = await Batch.findById(batchId);

        if (!batch) {
            throw new CustomError('Batch not found', 404);
        }

        const {
            baseScore,
            attendanceFull,
            attendanceHalf,
            attendanceMissed,
            quizMax,
            quizMissed,
            markCap,
            reason,
        } = configData;

        if (!reason || reason.trim().length < 20) {
            throw new CustomError('Reason must be at least 20 characters', 400);
        }

        const batchConfig = await BatchConfig.findOneAndUpdate(
            { batchId },
            {
                baseScore,
                attendanceFull,
                attendanceHalf,
                attendanceMissed,
                quizMax,
                quizMissed,
                markCap,
                reason,
            },
            {
                new: true,
                upsert: true,
            },
        );

        return {
            message: 'Batch config updated successfully',
            batchConfig,
        };
    }
    async getDashboard() {
        const totalStudents = await Student.countDocuments();

        const totalTeachers = await Instructor.countDocuments();

        const totalBatches = await Batch.countDocuments();

        const topScorers = await Student.find()
            .sort({ totalPoints: -1 })
            .limit(5)
            .populate({
                path: 'userId',
                select: 'name email',
            });

        const bottomScorers = await Student.find()
            .sort({ totalPoints: 1 })
            .limit(5)
            .populate({
                path: 'userId',
                select: 'name email',
            });

        return {
            message: 'Dashboard fetched successfully',
            dashboard: {
                totalStudents,
                totalTeachers,
                totalBatches,
                topScorers,
                bottomScorers,
            },
        };
    }
    async assignTeachersToBatch(batchId, teacherIds) {
        const batch = await Batch.findById(batchId);

        if (!batch) {
            throw new CustomError('Batch not found', 404);
        }

        if (!Array.isArray(teacherIds)) {
            throw new CustomError('teacherIds must be an array', 400);
        }

        const teachers = await Instructor.find({
            _id: { $in: teacherIds },
        });

        if (teachers.length !== teacherIds.length) {
            throw new CustomError('One or more teachers not found', 404);
        }

        batch.teacherIds = teacherIds;
        await batch.save();

        await Instructor.updateMany(
            { _id: { $in: teacherIds } },
            { $addToSet: { assignedBatches: batchId } },
        );

        return {
            message: 'Teachers assigned to batch successfully',
            batch,
        };
    }
}
export default new AdminService();