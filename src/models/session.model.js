import mongoose from 'mongoose';
import { schemaOptions, uuidId } from './modelHelpers.js';

const sessionSchema = new mongoose.Schema(
  {
    _id: uuidId,

    title: { type: String, required: true, trim: true },

    notes: { type: String, trim: true },

    recordingUrl: { type: String, trim: true },

    courseId: { type: String, ref: 'Course' },

    // NEW FIELD
    batchId: {
      type: String,
      ref: 'Batch',
      required: true,
    },

    instructorId: { type: String, ref: 'Instructor' },

    meetUrl: { type: String, trim: true },

    sessionDateAndTime: { type: Date, default: null },

    duration: { type: String, trim: true },

    status: {
      type: String,
      enum: ['scheduled', 'In Progress', 'live', 'completed', 'cancelled', 'postponed'],
      default: 'scheduled',
    },

    createdBy: { type: String, ref: 'User' },
    batchId: { type: String, ref: 'Batch', required: true },
    topicIds: [{ type: String, ref: 'Topic' }],
    actualStartTime: { type: Date, default: null },
    startTime: { type: String, trim: true },
    endTime: { type: String, trim: true },
    half1EndTime: { type: String, trim: true },
    assignmentTitle: { type: String, trim: true },
    assignmentDescription: { type: String, trim: true },
    assignmentDeadline: { type: Date, default: null },
    githubRepoSeed: { type: String, trim: true },
  },
  schemaOptions,
);

export default mongoose.models.Session ||
mongoose.model('Session', sessionSchema);