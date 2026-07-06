import mongoose from 'mongoose';
import { schemaOptions, uuidId } from './modelHelpers.js';
import * as markService from '../service/markService.js';

const studentLedgerSchema = new mongoose.Schema(
  {
    _id: uuidId,
    studentId: { type: String, ref: 'Student' },
    sourceType: { type: String, enum: ['assignment', 'quiz', 'attendance', 'extra'] },
    sourceId: { type: String, default: null },
    points: { type: Number, default: 0 },
    description: { type: String, trim: true },
    deletedAt: { type: Date, default: null },
  },
  {
    ...schemaOptions,
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  },
);

studentLedgerSchema.post('save', async function (doc) {
  if (doc.studentId) {
    await markService.applyMarkEvent(doc.studentId);
  }
});

studentLedgerSchema.post('findOneAndUpdate', async function (doc) {
  if (doc?.studentId) {
    await markService.applyMarkEvent(doc.studentId);
  }
});

export default mongoose.models.StudentLedger || mongoose.model('StudentLedger', studentLedgerSchema);