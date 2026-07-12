// src/middleware/auditLogger.js
import AuditLog from '../models/AuditLog.js';
import logger from '../utils/logger.js';

/**
 * Factory: creates a middleware that logs an audit event.
 * @param {string} action — must match AUDIT_ACTIONS constant
 * @param {function} [getTarget] — (req) => { type, id }
 */
export const auditLog =
  (action, getTarget = null) =>
  async (req, res, next) => {
    // Hook into res.json so we can capture the result after the handler runs
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      const result = body?.success ? 'success' : 'failure';
      const target = getTarget ? getTarget(req) : undefined;

      AuditLog.create({
        actor: req.user?._id,
        action,
        target,
        details: { method: req.method, path: req.originalUrl },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        result,
      }).catch((err) => logger.error('AuditLog write failed:', err));

      return originalJson(body);
    };
    next();
  };
