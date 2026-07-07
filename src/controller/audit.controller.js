import auditService from '../service/auditService.js';

function sendSuccess(res, statusCode, result) {
    const { message, ...data } = result;

    return res.status(statusCode).json({
        success: true,
        data,
        message,
    });
}

export async function getAuditLogs(req, res, next) {
    try {
        const result = await auditService.getAuditLogs(req.query);
        sendSuccess(res, 200, result);
    } catch (error) {
        next(error);
    }
}

export async function exportAuditLogs(req, res, next) {
    try {
        const result = await auditService.exportAuditLogs(req.query);
        sendSuccess(res, 200, result);
    } catch (error) {
        next(error);
    }
}

export async function createAuditLog(req, res, next) {
    try {
        const result = await auditService.createAuditLog({
            ...req.body,
            adminId: req.user.id,
        });

        sendSuccess(res, 201, result);
    } catch (error) {
        next(error);
    }
}