// src/models/Vehicle.js
import mongoose from 'mongoose';
import {
  VEHICLE_TYPE,
  VEHICLE_STATUS,
  FUEL_TYPE,
  TRANSMISSION,
  LISTING_STATUS,
} from '../constants/index.js';

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  isPrimary: { type: Boolean, default: false },
});

const specSchema = new mongoose.Schema({
  year: { type: Number, min: 1990, max: new Date().getFullYear() + 1 },
  seats: { type: Number, min: 1, max: 20 },
  doors: { type: Number, min: 0, max: 6 },
  mileage: Number,       // km/l or km/charge
  engineCC: Number,
  color: String,
  features: [String],   // e.g. ['AC', 'GPS', 'Sunroof']
});

const locationSchema = new mongoose.Schema({
  city: { type: String, required: true, trim: true },
  state: { type: String, trim: true },
  country: { type: String, trim: true, default: 'India' },
  pincode: String,
  coordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  },
});

const vehicleSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    make: {
      type: String,
      required: [true, 'Vehicle make is required'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Vehicle model is required'],
      trim: true,
    },
    vehicleType: {
      type: String,
      enum: Object.values(VEHICLE_TYPE),
      required: true,
    },
    fuelType: {
      type: String,
      enum: Object.values(FUEL_TYPE),
      required: true,
    },
    transmission: {
      type: String,
      enum: Object.values(TRANSMISSION),
      required: true,
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    images: [imageSchema],
    specifications: specSchema,
    location: { type: locationSchema, required: true },

    // Pricing (embedded + separate Pricing doc for history)
    pricing: {
      daily: { type: Number, required: true, min: 0 },
      weekly: { type: Number, min: 0 },
      monthly: { type: Number, min: 0 },
      securityDeposit: { type: Number, default: 0, min: 0 },
    },

    status: {
      type: String,
      enum: Object.values(VEHICLE_STATUS),
      default: VEHICLE_STATUS.AVAILABLE,
    },
    listingStatus: {
      type: String,
      enum: Object.values(LISTING_STATUS),
      default: LISTING_STATUS.PENDING,
    },
    rejectionReason: String,

    // Maintenance
    maintenanceSchedule: [
      {
        date: Date,
        description: String,
        completed: { type: Boolean, default: false },
      },
    ],

    // Analytics aggregates (updated by cron)
    totalRentals: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },

    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ───────────────────────────────────────────────────────────────
vehicleSchema.index({ 'location.city': 1 });
vehicleSchema.index({ vehicleType: 1 });
vehicleSchema.index({ fuelType: 1 });
vehicleSchema.index({ transmission: 1 });
vehicleSchema.index({ 'pricing.daily': 1 });
vehicleSchema.index({ status: 1, listingStatus: 1 });
vehicleSchema.index({ owner: 1, isDeleted: 1 });
vehicleSchema.index({ averageRating: -1 });
vehicleSchema.index({ 'location.coordinates': '2dsphere' });

// ─── Virtual: primary image ────────────────────────────────────────────────
vehicleSchema.virtual('primaryImage').get(function () {
  return this.images.find((img) => img.isPrimary) || this.images[0] || null;
});

vehicleSchema.pre(/^find/, function () {
  if (!this._skipDeletedFilter) {
    this.find({ isDeleted: { $ne: true } });
  }
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
