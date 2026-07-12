import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { CustomError } from '../../utils/customError.js';

export async function verifyToken(req, _res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new CustomError('Missing or invalid token', 401);
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).populate('roleId');

        if (!user || user.deletedAt) {
            throw new CustomError('User not found', 401);
        }

        if (user.profileStatus !== 'Active') {
            throw new CustomError('User account is not active', 403);
        }

        if (
            decoded.tokenVersion !== undefined &&
            decoded.tokenVersion !== user.tokenVersion
        ) {
            throw new CustomError('Token expired. Please login again.', 401);
        }

        req.user = {
            id: user._id,
            email: user.email,
            role: user.roleId?.name,
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            next(new CustomError('Invalid or expired token', 401));
            return;
        }

        next(error);
    }
}

export function requireRole(allowedRoles) {
    return (req, _res, next) => {
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

        if (!req.user) {
            next(new CustomError('Authentication required', 401));
            return;
        }

        const userRoleLower = req.user.role ? req.user.role.toLowerCase() : '';
        const hasRole = roles.some(role => role && role.toLowerCase() === userRoleLower);

        if (!hasRole) {
            next(new CustomError('Access denied', 403));
            return;
        }

        next();
    };
}