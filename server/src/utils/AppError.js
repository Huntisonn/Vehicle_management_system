// src/utils/AppError.js
/**
 * Operational error class.
 * Thrown by services/controllers so the global error handler can distinguish
 * expected errors (4xx) from unexpected ones (5xx).
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
