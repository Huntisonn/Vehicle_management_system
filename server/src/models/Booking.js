// src/models/Booking.js
import mongoose from 'mongoose';
import { BOOKING_STATUS, RENTAL_TYPE } from '../constants/index.js';

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Dates (stored as Date for range queries)
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    totalDays: {
      type: Number,
      required: true,
      min: [1, 'Minimum rental is 1 day'],
    },

    rentalType: {
      type: String,
      enum: Object.values(RENTAL_TYPE),
      required: true,
    },

    // Pricing snapshot (so historical data survives price changes)
    priceSnapshot: {
      daily: Number,
      weekly: Number,
      monthly: Number,
      securityDeposit: Number,
    },

    // Financial
    baseAmount: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    securityDeposit: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },

    // Promo
    promoCode: { type: mongoose.Schema.Types.ObjectId, ref: 'PromoCode', default: null },
    promoDiscount: { type: Number, default: 0 },

    // Status
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
    },
    cancellationReason: String,
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancelledAt: Date,
    rejectionReason: String,

    // Payment
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partial', 'paid', 'refunded'],
      default: 'unpaid',
    },
    paymentIntentId: String,    // Stripe
    paymentMethod: String,

    // Pickup/dropoff
    pickupLocation: String,
    dropoffLocation: String,

    // Customer notes
    notes: { type: String, maxlength: 500 },

    // Owner feedback
    ownerNotes: { type: String, maxlength: 500 },

    // Timestamps for state transitions
    approvedAt: Date,
    startedAt: Date,
    completedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Compound indexes — critical for double-booking prevention ─────────────
// Used in the conflict query: vehicle + overlapping date range + active status
bookingSchema.index(
  { vehicle: 1, startDate: 1, endDate: 1 },
  { name: 'vehicle_date_range' }
);
bookingSchema.index({ customer: 1, status: 1, startDate: -1 });
bookingSchema.index({ owner: 1, status: 1, startDate: -1 });
bookingSchema.index({ status: 1, startDate: 1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ createdAt: -1 });

// ─── Virtuals ──────────────────────────────────────────────────────────────
bookingSchema.virtual('duration').get(function () {
  if (!this.startDate || !this.endDate) return null;
  return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
});

// ─── Pre-validate: set totalDays ──────────────────────────────────────────
bookingSchema.pre('validate', function (next) {
  if (this.startDate && this.endDate) {
    const days = Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
    this.totalDays = days < 1 ? 1 : days;
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
