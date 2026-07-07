import mongoose from 'mongoose';
import { schemaOptions, uuidId } from './modelHelpers.js';

const batchSchema = new mongoose.Schema(
  {
    _id: uuidId,
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: '',
    },

    startDate: {
      type: Date,
      default: null,
    },

    endDate: {
      type: Date,
      default: null,
    },

    teacherIds: [
      {
        type: String,
        ref: 'Instructor',
      },
    ],

    studentIds: [
      {
        type: String,
        ref: 'Student',
      },
    ],

    recruiterUuid: {
      type: String,
      default: null,
    },

    recruiterLinkActive: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed'],
      default: 'upcoming',
    },
  },
  schemaOptions,
);

export default mongoose.models.Batch || mongoose.model('Batch', batchSchema);