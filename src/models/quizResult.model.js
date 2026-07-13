import mongoose from 'mongoose';
import { schemaOptions, uuidId } from './modelHelpers.js';

const quizResultSchema = new mongoose.Schema(
  {
    _id: uuidId,

    studentId: { type: String, ref: 'Student', required: true },

    quizId: { type: String, ref: 'Quiz', required: true },

    lectureId: { type: String, ref: 'Session', default: null },

    totalMarks: { type: Number, default: 5 },

    marksObtained: { type: Number, default: 0 },

    score: { type: Number, default: 0 },

    marksApplied: { type: Number, default: 0 },

    percentage: { type: Number, default: 0 },

    points: { type: Number, default: 0 },

    bonusPoints: { type: Number, default: 0 },

    totalPoints: { type: Number, default: 0 },

    timeTakenInMins: { type: Number, default: 0 },

    submittedAt: { type: Date, default: Date.now },

    uploadedBy: { type: String, ref: 'User', default: null },

    feedback: { type: String, default: '' },

    result: {
      type: String,
      enum: ['pass', 'failed', 'pending'],
      default: 'pending',
    },
  },
  schemaOptions,
);

quizResultSchema.index({ lectureId: 1, studentId: 1 }, { unique: true });

export default mongoose.models.QuizResult ||
  mongoose.model('QuizResult', quizResultSchema);