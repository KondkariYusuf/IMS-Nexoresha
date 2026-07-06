import mongoose from "mongoose";
import { schemaOptions, uuidId } from "./modelHelpers.js";

const quizSchema = new mongoose.Schema(
  {
    _id: uuidId,

    title: {
      type: String,
      required: true,
      trim: true,
    },

    batchId: {
      type: String,
      ref: "Batch",
      required: true,
    },

    sessionId: {
      type: String,
      ref: "Session",
      required: true,
    },

    link: {
      type: String,
      trim: true,
      required: true,
    },

    submissionDeadline: {
      type: Date,
      required: true,
    },

    totalMarks: {
      type: Number,
      required: true,
    },

    passingMarks: {
      type: Number,
      required: true,
    },

    totaldurationInMins: {
      type: Number,
      required: true,
    },

    createdBy: {
      type: String,
      ref: "User",
    },
  },
  schemaOptions
);

// One quiz per session
quizSchema.index(
  { sessionId: 1 },
  { unique: true }
);

// For batch-wise queries
quizSchema.index({
  batchId: 1,
});

export default mongoose.models.Quiz ||
  mongoose.model("Quiz", quizSchema);