import * as metricsService from '../service/metricsService.js';

function sendError(res, error) {
  return res.status(500).json({
    success: false,
    message: error.message,
  });
}

export async function getAllMetrics(req, res) {
  try {
    const { studentId, batchId } = req.params;
    const metrics = await metricsService.getAllMetrics(studentId, batchId);

    return res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getTotalScore(req, res) {
  try {
    const { studentId } = req.params;
    const value = await metricsService.getTotalScore(studentId);

    return res.status(200).json({ success: true, data: value });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getBatchRank(req, res) {
  try {
    const { studentId, batchId } = req.params;
    const value = await metricsService.getBatchRank(studentId, batchId);

    return res.status(200).json({ success: true, data: value });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getBatchPercentile(req, res) {
  try {
    const { studentId, batchId } = req.params;
    const value = await metricsService.getBatchPercentile(studentId, batchId);

    return res.status(200).json({ success: true, data: value });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getAssignmentAvgScore(req, res) {
  try {
    const { studentId } = req.params;
    const value = await metricsService.getAssignmentAvgScore(studentId);

    return res.status(200).json({ success: true, data: value });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getQuizAvgScore(req, res) {
  try {
    const { studentId } = req.params;
    const value = await metricsService.getQuizAvgScore(studentId);

    return res.status(200).json({ success: true, data: value });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getQuizParticipationRate(req, res) {
  try {
    const { studentId, batchId } = req.params;
    const value = await metricsService.getQuizParticipationRate(studentId, batchId);

    return res.status(200).json({ success: true, data: value });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getAttendanceRate(req, res) {
  try {
    const { studentId, batchId } = req.params;
    const value = await metricsService.getAttendanceRate(studentId, batchId);

    return res.status(200).json({ success: true, data: value });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getOnTimeSubmissionRate(req, res) {
  try {
    const { studentId, batchId } = req.params;
    const value = await metricsService.getOnTimeSubmissionRate(studentId, batchId);

    return res.status(200).json({ success: true, data: value });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getPunctualityIndex(req, res) {
  try {
    const { studentId, batchId } = req.params;
    const value = await metricsService.getPunctualityIndex(studentId, batchId);

    return res.status(200).json({ success: true, data: value });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getSubmissionLeadTime(req, res) {
  try {
    const { studentId } = req.params;
    const value = await metricsService.getSubmissionLeadTime(studentId);

    return res.status(200).json({ success: true, data: value });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getZeroMissStreaks(req, res) {
  try {
    const { studentId, batchId } = req.params;
    const value = await metricsService.getZeroMissStreaks(studentId, batchId);

    return res.status(200).json({ success: true, data: value });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getCodeQualityAvg(req, res) {
  try {
    const { studentId } = req.params;
    const value = await metricsService.getCodeQualityAvg(studentId);

    return res.status(200).json({ success: true, data: value });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getCodeImprovementRate(req, res) {
  try {
    const { studentId } = req.params;
    const value = await metricsService.getCodeImprovementRate(studentId);

    return res.status(200).json({ success: true, data: value });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getPerfectAssignmentCount(req, res) {
  try {
    const { studentId } = req.params;
    const value = await metricsService.getPerfectAssignmentCount(studentId);

    return res.status(200).json({ success: true, data: value });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getBelowAvgAssignmentRate(req, res) {
  try {
    const { studentId, batchId } = req.params;
    const value = await metricsService.getBelowAvgAssignmentRate(studentId, batchId);

    return res.status(200).json({ success: true, data: value });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getConsistencyScore(req, res) {
  try {
    const { studentId } = req.params;
    const value = await metricsService.getConsistencyScore(studentId);

    return res.status(200).json({ success: true, data: value });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getGrowthRate(req, res) {
  try {
    const { studentId, batchId } = req.params;
    const value = await metricsService.getGrowthRate(studentId, batchId);

    return res.status(200).json({ success: true, data: value });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getEngagementScore(req, res) {
  try {
    const { studentId, batchId } = req.params;
    const value = await metricsService.getEngagementScore(studentId, batchId);

    return res.status(200).json({ success: true, data: value });
  } catch (error) {
    return sendError(res, error);
  }
}
