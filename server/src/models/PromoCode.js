// src/models/PromoCode.js
import mongoose from 'mongoose';

const promoCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9]{4,20}$/, 'Invalid promo code format'],
    },
    description: String,
    discountType: {
      type: String,
      enum: ['percentage', 'flat'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    maxDiscount: Number,      // Cap for percentage discounts
    minOrderValue: { type: Number, default: 0 },
    usageLimit: Number,       // Total max uses
    usageCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true },

    applicableVehicleTypes: [String],  // empty = all types
    applicableCities: [String],         // empty = all cities

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

promoCodeSchema.index({ code: 1 }, { unique: true });
promoCodeSchema.index({ isActive: 1, validTo: 1 });

// Virtual: is currently valid
promoCodeSchema.virtual('isValid').get(function () {
  const now = new Date();
  return (
    this.isActive &&
    this.validFrom <= now &&
    this.validTo >= now &&
    (!this.usageLimit || this.usageCount < this.usageLimit)
  );
});

const PromoCode = mongoose.model('PromoCode', promoCodeSchema);
export default PromoCode;
