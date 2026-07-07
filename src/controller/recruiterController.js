import {
  getBatchOverviewService,
  getBatchStudentsService,
  getStudentPortfolioService,
} from '../service/recruiterService.js';

export async function getBatchOverview(req, res, next) {
  try {
    const result = await getBatchOverviewService(req.params.batchUuid);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getBatchStudents(req, res, next) {
  try {
    const result = await getBatchStudentsService(req.params.batchUuid);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getStudentPortfolio(req, res, next) {
  try {
    const result = await getStudentPortfolioService(
      req.params.batchUuid,
      req.params.id,
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}