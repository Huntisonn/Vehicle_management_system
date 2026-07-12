// src/services/authService.js
import crypto from 'crypto';
import { userRepository } from '../repositories/userRepository.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
} from '../utils/jwtHelper.js';
import { sendEmail, emailTemplates } from '../utils/emailHelper.js';
import AppError from '../utils/AppError.js';
import { ROLES } from '../constants/index.js';

export const authService = {
  /**
   * Register a new user.
   */
  register: async ({ name, email, password, role, phone }, res) => {
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new AppError('Email already registered', 409);

    const allowedRoles = [ROLES.CUSTOMER, ROLES.OWNER];
    const userRole = allowedRoles.includes(role) ? role : ROLES.CUSTOMER;

    const user = await userRepository.create({ name, email, password, role: userRole, phone });

    // Send welcome email (fire-and-forget)
    const { subject, html } = emailTemplates.welcome(name);
    sendEmail({ to: email, subject, html });

    const tokens = authService._generateTokens(user, res);
    return { user: authService._sanitize(user), ...tokens };
  },

  /**
   * Login with email + password.
   */
  login: async ({ email, password }, res) => {
    const user = await userRepository.findByEmail(email, '+password +refreshTokens');
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid email or password', 401);
    }
    if (user.isBlocked) throw new AppError('Your account has been blocked', 403);

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const tokens = authService._generateTokens(user, res);
    return { user: authService._sanitize(user), ...tokens };
  },

  /**
   * Refresh access token using httpOnly cookie.
   */
  refreshToken: async (req, res) => {
    const token = req.cookies?.refreshToken;
    if (!token) throw new AppError('Refresh token missing', 401);

    const decoded = verifyRefreshToken(token);
    const user = await userRepository.findById(decoded.id, '+refreshTokens');
    if (!user) throw new AppError('User not found', 401);
    if (!user.refreshTokens.includes(token)) {
      // Refresh token reuse detected — revoke all tokens
      await userRepository.clearRefreshTokens(user._id);
      throw new AppError('Refresh token reuse detected. Please log in again.', 401);
    }

    // Rotate: remove old token, issue new pair
    await userRepository.pullRefreshToken(user._id, token);
    const tokens = authService._generateTokens(user, res);
    return { user: authService._sanitize(user), ...tokens };
  },

  /**
   * Logout: clear refresh token from DB and cookie.
   */
  logout: async (req, res) => {
    const token = req.cookies?.refreshToken;
    if (token && req.user) {
      await userRepository.pullRefreshToken(req.user._id, token);
    }
    clearRefreshCookie(res);
  },

  /**
   * Initiate forgot-password flow.
   */
  forgotPassword: async (email) => {
    const user = await userRepository.findByEmail(email);
    if (!user) return; // Silent — don't reveal if email exists

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const { subject, html } = emailTemplates.resetPassword(user.name, resetUrl);
    await sendEmail({ to: user.email, subject, html });
  },

  /**
   * Reset password using the plain token from the email link.
   */
  resetPassword: async (plainToken, newPassword) => {
    const hashedToken = crypto.createHash('sha256').update(plainToken).digest('hex');
    const user = await userRepository.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }, '+passwordResetToken +passwordResetExpires');

    if (!user) throw new AppError('Reset link is invalid or has expired', 400);

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await userRepository.clearRefreshTokens(user._id);
    await user.save();
  },

  /**
   * Change password for authenticated user.
   */
  changePassword: async (userId, currentPassword, newPassword) => {
    const user = await userRepository.findById(userId, '+password');
    if (!(await user.comparePassword(currentPassword))) {
      throw new AppError('Current password is incorrect', 400);
    }
    user.password = newPassword;
    await userRepository.clearRefreshTokens(userId);
    await user.save();
  },

  // ─── Internals ───────────────────────────────────────────────────────────
  _generateTokens: (user, res) => {
    const payload = { id: user._id, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Persist refresh token (token rotation)
    userRepository.pushRefreshToken(user._id, refreshToken);
    setRefreshCookie(res, refreshToken);

    return { accessToken, refreshToken };
  },

  _sanitize: (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    avatar: user.avatar,
    ownerStatus: user.ownerStatus,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
  }),
};
