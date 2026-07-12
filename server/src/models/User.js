// src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { ROLES, OWNER_STATUS } from '../constants/index.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.CUSTOMER,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-()]{7,15}$/, 'Please enter a valid phone number'],
    },
    avatar: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
    },
    drivingLicense: {
      number: { type: String, trim: true },
      expiry: Date,
      verified: { type: Boolean, default: false },
    },

    // Owner-specific fields
    ownerStatus: {
      type: String,
      enum: Object.values(OWNER_STATUS),
      default: null,
    },
    businessName: { type: String, trim: true },
    businessAddress: { type: String, trim: true },

    // Auth
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    refreshTokens: { type: [String], select: false, default: [] },

    // Status
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    lastLogin: Date,

    // Wishlist
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' }],

    // Push notification token (FCM)
    fcmToken: { type: String, select: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ───────────────────────────────────────────────────────────────
userSchema.index({ role: 1 });
userSchema.index({ isBlocked: 1 });
userSchema.index({ ownerStatus: 1 });
userSchema.index({ createdAt: -1 });

// ─── Pre-save: hash password ───────────────────────────────────────────────
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ─── Instance methods ──────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.createPasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 min
  return token;
};

userSchema.methods.createEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 h
  return token;
};

userSchema.pre(/^find/, function () {
  if (!this._skipDeletedFilter) {
    this.find({ isDeleted: { $ne: true } });
  }
});

const User = mongoose.model('User', userSchema);
export default User;
