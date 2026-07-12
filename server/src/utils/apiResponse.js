// src/utils/apiResponse.js
// Unified response helpers so every endpoint returns a consistent shape

/**
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {*} [data]
 * @param {object} [meta]  — pagination, counts, etc.
 */
export const sendSuccess = (res, statusCode, message, data = null, meta = null) => {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  if (meta !== null) body.meta = meta;
  return res.status(statusCode).json(body);
};

/**
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {Array} [errors]
 */
export const sendError = (res, statusCode, message, errors = []) => {
  const body = { success: false, message };
  if (errors.length) body.errors = errors;
  return res.status(statusCode).json(body);
};

/**
 * Build standardised pagination meta object.
 */
export const paginationMeta = (total, page, limit) => ({
  total,
  page: Number(page),
  limit: Number(limit),
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});
