import mongoose from 'mongoose';
import { schemaOptions, uuidId } from './modelHelpers.js';

const studentLedgerSchema = new mongoose.Schema(
  {
    _id: uuidId,

    studentId: {
      type: String,
      ref: 'Student',
      required: true,
    },

    batchId: {
      type: String,
      ref: 'Batch',
      required: true,
    },

    sourceType: {
      type: String,
      enum: ['assignment', 'quiz', 'attendance', 'extra', 'admin_override', 'reversal'],
      required: true,
    },

    sourceId: {
      type: String,
      default: null,
    },

    points: {
      type: Number,
      required: true,
      default: 0,
    },

    runningTotal: {
      type: Number,
      default: 0,
    },

    excessPoints: {
      type: Number,
      default: 0,
    },

    description: {
      type: String,
      trim: true,
    },

    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    isReversal: {
      type: Boolean,
      default: false,
    },

    reversalOf: {
      type: String,
      ref: 'StudentLedger',
      default: null,
    },

    createdBy: {
      type: String,
      ref: 'User',
      default: null,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    ...schemaOptions,
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  },
);

export default mongoose.models.StudentLedger ||
  mongoose.model('StudentLedger', studentLedgerSchema);
