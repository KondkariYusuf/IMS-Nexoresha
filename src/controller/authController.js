import authService from '../service/authService.js';

function sendSuccess(res, statusCode, result) {
    const { message, ...data } = result;

    return res.status(statusCode).json({
        success: true,
        data,
        message,
    });
}

export async function login(req, res, next) {
    try {
        const result = await authService.login(req.body);
        sendSuccess(res, 200, result);
    } catch (error) {
        next(error);
    }
}

export async function logout(req, res, next) {
    try {
        const result = await authService.logout(req.user.id);
        sendSuccess(res, 200, result);
    } catch (error) {
        next(error);
    }
}

export async function refresh(req, res, next) {
    try {
        const result = await authService.refresh(req.body.refreshToken);
        sendSuccess(res, 200, result);
    } catch (error) {
        next(error);
    }
}

export async function changePassword(req, res, next) {
    try {
        const result = await authService.changePassword(req.user.id, req.body);
        sendSuccess(res, 200, result);
    } catch (error) {
        next(error);
    }
}

export async function sendOtp(req, res, next) {
    try {
        const result = await authService.sendOtp(req.body);
        sendSuccess(res, 200, result);
    } catch (error) {
        next(error);
    }
}

export async function verifyOtp(req, res, next) {
    try {
        const result = await authService.verifyOtp(req.body);
        sendSuccess(res, 200, result);
    } catch (error) {
        next(error);
    }
}

export async function resetPassword(req, res, next) {
    try {
        const result = await authService.resetPassword(req.body);
        sendSuccess(res, 200, result);
    } catch (error) {
        next(error);
    }
}