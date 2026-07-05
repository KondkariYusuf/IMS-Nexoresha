import { StudentLedger, Student } from '../models/index.js';

/**
 * Temporary lightweight fallback service to apply points events.
 * Can be replaced by the future Dev 1 ledger service without breaking callers.
 * 
 * Supports both destructuring (object params) and positional arguments.
 */
export async function applyPointsEvent(studentId, sourceType, sourceId, points, description) {
  let sId = studentId;
  let type = sourceType;
  let srcId = sourceId;
  let pts = points;
  let desc = description;

  if (typeof studentId === 'object' && studentId !== null) {
    sId = studentId.studentId;
    type = studentId.sourceType;
    srcId = studentId.sourceId;
    pts = studentId.points;
    desc = studentId.description;
  }

  console.log(`[PointsService-Fallback] Applying points event: studentId=${sId}, sourceType=${type}, sourceId=${srcId}, points=${pts}`);

  // Create StudentLedger entry
  const ledgerEntry = new StudentLedger({
    studentId: sId,
    sourceType: type,
    sourceId: srcId,
    points: pts,
    description: desc || `Awarded ${pts} points for ${type}`
  });
  await ledgerEntry.save();

  // Increment Student's totalPoints
  await Student.findByIdAndUpdate(sId, {
    $inc: { totalPoints: pts }
  });

  return ledgerEntry;
}
