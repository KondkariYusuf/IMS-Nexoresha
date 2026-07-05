import mongoose from 'mongoose';
import { schemaOptions, uuidId } from './modelHelpers.js';

const batchConfigSchema = new mongoose.Schema(
    {
        _id: uuidId,

        batchId: {
            type: String,
            ref: 'Batch',
            required: true,
            unique: true,
        },

        baseScore: {
            type: Number,
            default: 30,
        },

        attendanceFull: {
            type: Number,
            default: 2.5,
        },

        attendanceHalf: {
            type: Number,
            default: 1,
        },

        attendanceMissed: {
            type: Number,
            default: -5,
        },

        quizMax: {
            type: Number,
            default: 5,
        },

        quizMissed: {
            type: Number,
            default: -2.5,
        },

        markCap: {
            type: Number,
            default: 100,
        },

        reason: {
            type: String,
            trim: true,
            default: '',
        },
    },
    schemaOptions,
);

export default mongoose.models.BatchConfig ||
    mongoose.model('BatchConfig', batchConfigSchema);