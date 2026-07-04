import mongoose from 'mongoose';
import { schemaOptions, uuidId } from './modelHelpers.js';

const notificationSchema = new mongoose.Schema(
  {
    _id: uuidId,
    userId: {
      type: String,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    ...schemaOptions,
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

// Add an index on userId for fast query retrievals
notificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
