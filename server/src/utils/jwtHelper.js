// src/utils/jwtHelper.js
import jwt from 'jsonwebtoken';
import AppError from './AppError.js';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'rentigo_default_access_secret_key_change_me_in_production';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'rentigo_default_refresh_secret_key_change_me_in_production';

export const signAccessToken = (payload) =>
  jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });

export const signRefreshToken = (payload) =>
  jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, ACCESS_SECRET);
  } catch (err) {
    throw new AppError(
      err.name === 'TokenExpiredError' ? 'Access token expired' : 'Invalid access token',
      401
    );
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch (err) {
    throw new AppError(
      err.name === 'TokenExpiredError' ? 'Refresh token expired' : 'Invalid refresh token',
      401
    );
  }
};

/** Send the refresh token as a secure httpOnly cookie. */
export const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const clearRefreshCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'strict',
  });
};
