import { Student } from '../models/index.js';
import * as cacheService from './cacheService.js';

async function applyMarkEvent(studentId) {
  if (!studentId) {
    return;
  }

  const student = await Student.findById(studentId).select('batchId').lean();
  if (!student || !student.batchId) {
    return;
  }

  await cacheService.invalidateBatchCache(student.batchId);
}

export {
  applyMarkEvent,
};
