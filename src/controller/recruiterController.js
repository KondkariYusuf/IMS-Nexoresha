import {
  getBatchOverviewService,
  getBatchStudentsService,
  getStudentPortfolioService,
} from '../service/recruiterService.js';

export async function getBatchOverview(req, res) {
  const result = await getBatchOverviewService(req.params.batchUuid);
  res.json(result);
}

export async function getBatchStudents(req, res) {
  const result = await getBatchStudentsService(req.params.batchUuid);
  res.json(result);
}

export async function getStudentPortfolio(req, res) {
  const result = await getStudentPortfolioService(
    req.params.batchUuid,
    req.params.id
  );

  res.json(result);
}