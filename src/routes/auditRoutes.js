import express from 'express';
import {
    getAuditLogs,
    exportAuditLogs,
    createAuditLog,
} from '../controller/audit.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken, requireRole('admin'));

router.get('/', getAuditLogs);
router.get('/export', exportAuditLogs);
router.post('/', createAuditLog);

export default router;