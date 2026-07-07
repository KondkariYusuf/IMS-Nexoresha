import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../models/index.js';
import { CustomError } from '../../utils/customError.js';

function signAccessToken(user, roleName) {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: roleName,
            tokenVersion: user.tokenVersion,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    );
}

function signRefreshToken(user) {
    return jwt.sign(
        {
            id: user._id,
            tokenVersion: user.tokenVersion,
            type: 'refresh',
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' },
    );
}

async function login({ email, password }) {
    if (!email || !password) {
        throw new CustomError('Email and password are required', 400);
    }

    const user = await User.findOne({ email }).populate('roleId');

    if (!user) {
        throw new CustomError('Invalid email or password', 401);
    }

    if (user.profileStatus !== 'Active') {
        throw new CustomError('User account is not active', 403);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new CustomError('Invalid email or password', 401);
    }

    const roleName = user.roleId?.name;

    return {
        message: 'Login successful',
        accessToken: signAccessToken(user, roleName),
        refreshToken: signRefreshToken(user),
        user: {
            id: user._id,
            name: user.name,
            role: roleName,
            email: user.email,
        },
    };
}

async function logout(userId) {
    await User.findOneAndUpdate(
        { _id: userId },
        { $inc: { tokenVersion: 1 } },
    );

    return {
        message: 'Logout successful',
    };
}

async function refresh(refreshToken) {
    if (!refreshToken) {
        throw new CustomError('Refresh token is required', 400);
    }

    let decoded;

    try {
        decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (_error) {
        throw new CustomError('Invalid or expired refresh token', 401);
    }

    if (decoded.type !== 'refresh') {
        throw new CustomError('Invalid refresh token', 401);
    }

    const user = await User.findOne({ _id: decoded.id }).populate('roleId');

    if (!user || user.deletedAt) {
        throw new CustomError('User not found', 401);
    }

    if (user.profileStatus !== 'Active') {
        throw new CustomError('User account is not active', 403);
    }

    if (decoded.tokenVersion !== user.tokenVersion) {
        throw new CustomError('Refresh token expired. Please login again.', 401);
    }

    const roleName = user.roleId?.name;

    return {
        message: 'Token refreshed successfully',
        accessToken: signAccessToken(user, roleName),
        refreshToken: signRefreshToken(user),
    };
}

async function changePassword(userId, { currentPassword, newPassword }) {
    if (!currentPassword || !newPassword) {
        throw new CustomError('currentPassword and newPassword are required', 400);
    }

    if (newPassword.length < 6) {
        throw new CustomError('New password must be at least 6 characters', 400);
    }

    const user = await User.findOne({ _id: userId });

    if (!user) {
        throw new CustomError('User not found', 404);
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
        throw new CustomError('Current password is incorrect', 400);
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordChangedAt = new Date();
    user.tokenVersion += 1;

    await user.save();

    return {
        message: 'Password changed successfully',
    };
}

export default {
    login,
    logout,
    refresh,
    changePassword,
};