import mongoose from 'mongoose';
import { schemaOptions, uuidId } from './modelHelpers.js';

const topicSchema = new mongoose.Schema(
  {
    _id: uuidId,
    batchId: { type: String, ref: 'Batch', required: true },
    title: { type: String, required: true, maxlength: 120, trim: true },
    description: { type: String, required: true, trim: true }, // HTML Rich Text
    learningObjectives: {
      type: [String],
      validate: {
        validator: function (v) {
          return v && v.length >= 1 && v.length <= 10;
        },
        message: 'A topic must have between 1 and 10 learning objectives.',
      },
    },
    estimatedHours: { type: Number, required: true, min: 0 },
    orderIndex: { type: Number, required: true },
    notesFiles: [{ type: String }], // Array of file storage paths/URLs
  },
  schemaOptions,
);

// Compound unique index on batchId and orderIndex
topicSchema.index({ batchId: 1, orderIndex: 1 }, { unique: true });

export default mongoose.models.Topic || mongoose.model('Topic', topicSchema);
