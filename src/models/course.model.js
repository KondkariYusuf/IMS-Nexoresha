import mongoose from 'mongoose';
import { schemaOptions, uuidId } from './modelHelpers.js';

const courseSchema = new mongoose.Schema(
  {
    _id: uuidId,
    name: { type: String, required: true, trim: true },
    instructorIds: [{ type: String, ref: 'Instructor' }],
    batchId: { type: String, ref: 'Batch', required: true },
  },
  schemaOptions,
);

export default mongoose.models.Course || mongoose.model('Course', courseSchema);
