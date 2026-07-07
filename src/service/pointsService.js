import { StudentLedger, Student } from '../models/index.js';

export async function applyPointsEvent(
  studentId,
  sourceType,
  sourceId,
  points,
  description,
  options = {},
) {
  let sId = studentId;
  let type = sourceType;
  let srcId = sourceId;
  let pts = points;
  let desc = description;
  let opts = options;
  let batchId = opts.batchId;

  if (typeof studentId === 'object' && studentId !== null) {
    sId = studentId.studentId;
    type = studentId.sourceType;
    srcId = studentId.sourceId;
    pts = studentId.points;
    desc = studentId.description;
    opts = studentId.options || studentId;

    batchId = studentId.batchId;
  }

  const session = opts.session;

  const ledgerEntry = new StudentLedger({
    studentId: sId,
    batchId,
    sourceType: type,
    sourceId: srcId,
    points: pts,
    description: desc || `Awarded ${pts} points for ${type}`,
  });

  if (session) await ledgerEntry.save({ session });
  else await ledgerEntry.save();

  await Student.findByIdAndUpdate(
    sId,
    { $inc: { totalPoints: pts } },
    session ? { session } : {},
  );

  return ledgerEntry;
}

export async function applyMarkEvent(payload) {
  return applyPointsEvent({
    studentId: payload.studentId,
    batchId: payload.batchId,
    sourceType: payload.eventType,
    sourceId: payload.lectureId,
    points: payload.marksApplied,
    description: `${payload.eventType} marks applied`,
    options: payload,
  });
}