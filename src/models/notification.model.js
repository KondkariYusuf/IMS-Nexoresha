import mongoose from 'mongoose';
import { schemaOptions, uuidId } from './modelHelpers.js';

const notificationSchema = new mongoose.Schema(
  {
    _id: uuidId,
    userId: { type: String, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, trim: true },
    type: {
      type: String,
      enum: ['assignment', 'session', 'marks', 'general'],
      default: 'general',
    },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
  },
  {
    ...schemaOptions,
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  },
);

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
