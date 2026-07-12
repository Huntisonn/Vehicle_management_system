// src/middleware/auth.js
import { verifyAccessToken } from '../utils/jwtHelper.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { ROLES } from '../constants/index.js';

/**
 * Authenticate request via Bearer token.
 * Attaches `req.user` (lean user doc) on success.
 */
export const authenticate = async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401));
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token); // throws AppError on failure

  const user = await User.findById(decoded.id).select('+isBlocked +isDeleted');
  if (!user) return next(new AppError('User no longer exists', 401));
  if (user.isBlocked) return next(new AppError('Your account has been blocked', 403));
  if (user.isDeleted) return next(new AppError('Account not found', 401));

  req.user = user;
  next();
};

/**
 * Role-based access control middleware factory.
 * Usage: authorize(ROLES.ADMIN, ROLES.OWNER)
 */
export const authorize = (...roles) =>
  (req, _res, next) => {
    if (!roles.includes(req.user?.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };

/** Shorthand helpers */
export const requireAdmin = authorize(ROLES.ADMIN);
export const requireOwner = authorize(ROLES.OWNER, ROLES.ADMIN);
export const requireCustomer = authorize(ROLES.CUSTOMER);

/**
 * Optional auth — attaches user if token present, otherwise continues.
 */
export const optionalAuth = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return next();
    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);
    if (user && !user.isBlocked && !user.isDeleted) req.user = user;
  } catch {
    // Silently ignore — optional auth
  }
  next();
};
