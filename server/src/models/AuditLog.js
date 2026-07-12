// src/models/AuditLog.js
import mongoose from 'mongoose';
import { AUDIT_ACTIONS } from '../constants/index.js';

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    action: {
      type: String,
      enum: Object.values(AUDIT_ACTIONS),
      required: true,
    },
    target: {
      type: { type: String },  // 'User', 'Vehicle', 'Booking'
      id: mongoose.Schema.Types.ObjectId,
    },
    details: mongoose.Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String,
    result: {
      type: String,
      enum: ['success', 'failure'],
      default: 'success',
    },
  },
  { timestamps: true }
);

// TTL: auto-delete logs older than 1 year
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });
auditLogSchema.index({ actor: 1, action: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
