import { CustomError } from '../../utils/customError.js';

/**
 * Dummy middleware to decode a mock JWT token and attach user to req.
 * If a valid token payload (as JSON string) is passed in Authorization header, it uses it.
 * Otherwise, it defaults to a mock instructor user.
 */
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      // Decode helper for testing - can parse JSON tokens
      if (token.startsWith('{')) {
        req.user = JSON.parse(decodeURIComponent(token));
      } else {
        // Default mock instructor user
        req.user = { id: 'test-user-id', role: 'instructor', email: 'instructor@example.com' };
      }
    } catch (e) {
      req.user = { id: 'test-user-id', role: 'instructor', email: 'instructor@example.com' };
    }
  } else {
    // Default fallback mock user
    req.user = { id: 'test-user-id', role: 'instructor', email: 'instructor@example.com' };
  }
  next();
};

/**
 * Dummy middleware to restrict routes based on user role.
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      next(new CustomError('Forbidden: Access denied', 403));
    }
  };
};
