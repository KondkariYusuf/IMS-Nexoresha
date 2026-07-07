import mongoose from 'mongoose';
import { schemaOptions, uuidId } from './modelHelpers.js';

const notificationSchema = new mongoose.Schema(
  {
    _id: uuidId,
    userId: { type: String, ref: 'User', required: true },
    title: { type: String, trim: true, default: 'Notification' },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      trim: true,
      default: 'general'
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    read: { type: Boolean, default: false },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
  },
  {
    ...schemaOptions,
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

// Add an index on userId for fast query retrievals
notificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
