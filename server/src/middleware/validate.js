// src/middleware/validate.js
import { validationResult } from 'express-validator';
import { sendError } from '../utils/apiResponse.js';

/**
 * Run after express-validator chains.
 * Returns 422 with all field errors if validation fails.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    return sendError(res, 422, 'Validation failed', formatted);
  }
  next();
};

export default validate;
