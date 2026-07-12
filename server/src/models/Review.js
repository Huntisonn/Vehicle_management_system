// src/models/Review.js
import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true, // One review per booking
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
      trim: true,
    },
    // Granular ratings
    cleanliness: { type: Number, min: 1, max: 5 },
    comfort: { type: Number, min: 1, max: 5 },
    valueForMoney: { type: Number, min: 1, max: 5 },
    ownerResponsiveness: { type: Number, min: 1, max: 5 },

    // Owner reply
    ownerReply: { type: String, maxlength: 500 },
    ownerReplyAt: Date,

    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ─── Indexes ───────────────────────────────────────────────────────────────
reviewSchema.index({ vehicle: 1, createdAt: -1 });
reviewSchema.index({ customer: 1, createdAt: -1 });

// ─── Post-save: update vehicle average rating ─────────────────────────────
reviewSchema.post('save', async function () {
  const Vehicle = mongoose.model('Vehicle');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { vehicle: this.vehicle, isPublished: true } },
    { $group: { _id: '$vehicle', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Vehicle.findByIdAndUpdate(this.vehicle, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      ratingCount: stats[0].count,
    });
  }
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
