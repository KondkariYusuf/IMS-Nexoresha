import { Router } from 'express';
import {
    login,
    logout,
    refresh,
    changePassword,
    sendOtp,
    verifyOtp,
    resetPassword
} from '../controller/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', verifyToken, logout);
router.post('/change-password', verifyToken, changePassword);

// OTP routes
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

export default router;