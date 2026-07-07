import mongoose from 'mongoose';
import { schemaOptions, uuidId } from './modelHelpers.js';

const attendanceSchema = new mongoose.Schema(
  {
    _id: uuidId,

    studentId: {
      type: String,
      ref: 'Student',
      required: true,
    },

    courseId: {
      type: String,
      ref: 'Course',
      default: null,
    },

    sessionId: {
      type: String,
      ref: 'Session',
      required: true,
    },

    lectureId: {
      type: String,
      ref: 'Session',
      required: true,
    },

    status: {
      type: String,
      enum: ['present', 'absent', 'half'],
      required: true,
    },

    firstHalf: {
      type: Boolean,
      default: false,
    },

    secondHalf: {
      type: Boolean,
      default: false,
    },

    marksApplied: {
      type: Number,
      required: true,
    },

    markedBy: {
      type: String,
      ref: 'User',
      default: null,
    },

    markedAt: {
      type: Date,
      default: Date.now,
    },
  },
  schemaOptions,
);

attendanceSchema.index({ lectureId: 1, studentId: 1 }, { unique: true });

export default mongoose.models.Attendance ||
  mongoose.model('Attendance', attendanceSchema);