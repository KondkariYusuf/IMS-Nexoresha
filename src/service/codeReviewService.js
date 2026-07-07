import { AssignmentSubmission, AssignmentResult } from '../models/index.js';
import { CustomError } from '../../utils/customError.js';

/**
 * Mock codeReviewService.js
 * Dev 3 relies on this to be built by Dev 2.
 * We mock it here so that the submission flow completes.
 */

export async function queueReview(submissionId) {
  console.log(`[MOCK Queue] Code review queued for submission: ${submissionId}`);

  // Simulate an asynchronous background job processing the review
  setTimeout(async () => {
    try {
      console.log(`[MOCK Worker] Processing review for submission: ${submissionId}`);
      
      const submission = await AssignmentSubmission.findById(submissionId).lean();
      if (!submission) return;

      // Simulate Dev 2 creating the AssignmentResult document
      await AssignmentResult.create({
        submissionId: submission._id,
        totalMarks: 10,
        marksObtained: 8,
        percentage: 80,
        points: 8,
        bonusPoints: 0,
        totalPoints: 8,
        feedback: 'Good implementation. Next time try to improve error handling.',
        codeQualityScore: 7,
        evalAt: new Date(),
        result: 'pass',
      });
      
      console.log(`[MOCK Worker] Finished review for submission: ${submissionId}`);
    } catch (err) {
      console.error(`[MOCK Worker] Error in review:`, err);
    }
  }, 2000); // 2 second delay to simulate work
}
