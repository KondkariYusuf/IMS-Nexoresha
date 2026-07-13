import { AuditLog } from '../models/index.js';
import { CustomError } from '../../utils/customError.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function buildFilter({ from, to, adminId, actionType }) {
    const filter = {};

    if (adminId) {
        filter.adminId = adminId;
    }

    if (actionType) {
        filter.actionType = actionType;
    }

    if (from || to) {
        filter.createdAt = {};

        if (from) {
            const fromDate = new Date(from);
            if (Number.isNaN(fromDate.getTime())) {
                throw new CustomError('from must be a valid date', 400);
            }
            filter.createdAt.$gte = fromDate;
        }

        if (to) {
            const toDate = new Date(to);
            if (Number.isNaN(toDate.getTime())) {
                throw new CustomError('to must be a valid date', 400);
            }
            filter.createdAt.$lte = toDate;
        }
    }

    return filter;
}

// GET /api/v1/admin/audit-log
async function getAuditLogs(query) {
    const filter = buildFilter(query);

    const page = Math.max(Number(query.page) || DEFAULT_PAGE, 1);
    const limit = Math.min(Math.max(Number(query.limit) || DEFAULT_LIMIT, 1), MAX_LIMIT);
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
        AuditLog.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        AuditLog.countDocuments(filter),
    ]);

    return {
        message: 'Audit logs fetched successfully',
        logs,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
        },
    };
}

// GET /api/v1/admin/audit-log/export  (JSON export, no CSV)
async function exportAuditLogs(query) {
    const filter = buildFilter(query);

    const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).lean();

    return {
        message: 'Audit log export generated successfully',
        exportedAt: new Date().toISOString(),
        count: logs.length,
        logs,
    };
}

// POST /api/v1/admin/audit-log  (manual entry, for admin actions outside the marks flow)
async function createAuditLog({ adminId, actionType, entityType, entityId, oldValue, newValue, reason }) {
    if (!actionType || !entityType || !reason) {
        throw new CustomError('actionType, entityType and reason are required', 400);
    }

    const log = await AuditLog.create({
        adminId: adminId || null,
        actionType,
        entityType,
        entityId: entityId || null,
        oldValue: oldValue ?? null,
        newValue: newValue ?? null,
        reason,
    });

    return {
        message: 'Audit log created successfully',
        log,
    };
}

export default {
    getAuditLogs,
    exportAuditLogs,
    createAuditLog,
};