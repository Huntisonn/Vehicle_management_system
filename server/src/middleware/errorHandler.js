// src/middleware/errorHandler.js
import mongoose from 'mongoose';
import AppError from '../utils/AppError.js';
import { sendError } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';

const handleCastError = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(`${field} already exists`, 409);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((e) => ({
    field: e.path,
    message: e.message,
  }));
  return new AppError('Validation failed', 422, errors);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again.', 401);
const handleJWTExpired = () => new AppError('Token expired. Please log in again.', 401);

/**
 * Global error handler — last Express middleware.
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Transform known Mongoose / JWT errors into operational AppErrors
  if (err instanceof mongoose.Error.CastError) error = handleCastError(err);
  else if (err.code === 11000) error = handleDuplicateKeyError(err);
  else if (err instanceof mongoose.Error.ValidationError) error = handleValidationError(err);
  else if (err.name === 'JsonWebTokenError') error = handleJWTError();
  else if (err.name === 'TokenExpiredError') error = handleJWTExpired();
  else if (!error.isOperational) {
    // Unknown/programming error — log and return generic message
    logger.error('UNHANDLED ERROR', err);
    error = new AppError('Something went wrong on our end.', 500);
  }

  if (process.env.NODE_ENV !== 'production') {
    logger.error(`${req.method} ${req.originalUrl} → ${error.statusCode}: ${error.message}`);
  }

  return sendError(res, error.statusCode, error.message, error.errors || []);
};

export default errorHandler;
