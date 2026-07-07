import mongoose from 'mongoose';
import { schemaOptions, uuidId } from './modelHelpers.js';

const quizUploadSchema = new mongoose.Schema(
    {
        _id: uuidId,
        lectureId: { type: String, ref: 'Session', required: true },
        uploadedBy: { type: String, ref: 'User', default: null },
        payload: { type: Array, default: [] },
        processed: { type: Number, default: 0 },
        errors: { type: Array, default: [] },
        replacedPrevious: { type: Boolean, default: false },
        uploadedAt: { type: Date, default: Date.now },
    },
    schemaOptions,
);

export default mongoose.models.QuizUpload ||
    mongoose.model('QuizUpload', quizUploadSchema);