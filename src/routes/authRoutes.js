import { Router } from 'express';
import {
    login,
    logout,
    refresh,
    changePassword,
} from '../controller/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', verifyToken, logout);
router.post('/change-password', verifyToken, changePassword);

export default router;