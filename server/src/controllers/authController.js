// src/controllers/authController.js
import { authService } from '../services/authService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { StatusCodes } from 'http-status-codes';

export const authController = {
  register: async (req, res) => {
    const result = await authService.register(req.body, res);
    sendSuccess(res, StatusCodes.CREATED, 'Registration successful', result);
  },

  login: async (req, res) => {
    const result = await authService.login(req.body, res);
    sendSuccess(res, StatusCodes.OK, 'Login successful', result);
  },

  logout: async (req, res) => {
    await authService.logout(req, res);
    sendSuccess(res, StatusCodes.OK, 'Logged out successfully');
  },

  refreshToken: async (req, res) => {
    const result = await authService.refreshToken(req, res);
    sendSuccess(res, StatusCodes.OK, 'Token refreshed', result);
  },

  forgotPassword: async (req, res) => {
    await authService.forgotPassword(req.body.email);
    // Always return success to prevent email enumeration
    sendSuccess(res, StatusCodes.OK, 'If this email exists, a reset link has been sent');
  },

  resetPassword: async (req, res) => {
    await authService.resetPassword(req.params.token, req.body.password);
    sendSuccess(res, StatusCodes.OK, 'Password reset successful');
  },

  changePassword: async (req, res) => {
    await authService.changePassword(
      req.user._id,
      req.body.currentPassword,
      req.body.newPassword
    );
    sendSuccess(res, StatusCodes.OK, 'Password changed successfully');
  },

  getMe: async (req, res) => {
    sendSuccess(res, StatusCodes.OK, 'Profile fetched', req.user);
  },
};
