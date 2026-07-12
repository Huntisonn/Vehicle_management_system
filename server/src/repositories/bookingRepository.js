// src/repositories/bookingRepository.js
import Booking from '../models/Booking.js';
import { BOOKING_STATUS, PAGINATION } from '../constants/index.js';

export const bookingRepository = {
  findById: (id) =>
    Booking.findById(id)
      .populate('customer', 'name email phone avatar')
      .populate('vehicle', 'make model images registrationNumber pricing location')
      .populate('owner', 'name email phone businessName'),

  findByIdRaw: (id) => Booking.findById(id),

  create: (data) => Booking.create(data),

  updateById: (id, data, options = { new: true }) =>
    Booking.findByIdAndUpdate(id, data, options),

  /**
   * THE critical overlap query for double-booking prevention.
   * Returns conflicting bookings if any exist.
   *
   * Overlap condition:
   *   newStart <= existingEnd  AND  newEnd >= existingStart
   *
   * We only block on approved or active bookings (pending is not a block).
   */
  findConflictingBookings: (vehicleId, startDate, endDate, excludeBookingId = null) => {
    const filter = {
      vehicle: vehicleId,
      status: { $in: [BOOKING_STATUS.APPROVED, BOOKING_STATUS.ACTIVE] },
      startDate: { $lte: new Date(endDate) },
      endDate: { $gte: new Date(startDate) },
    };
    if (excludeBookingId) filter._id = { $ne: excludeBookingId };
    return Booking.find(filter);
  },

  /**
   * Get booked date ranges for a vehicle (for the availability calendar).
   */
  getBookedDates: (vehicleId) =>
    Booking.find({
      vehicle: vehicleId,
      status: { $in: [BOOKING_STATUS.APPROVED, BOOKING_STATUS.ACTIVE, BOOKING_STATUS.PENDING] },
    }).select('startDate endDate status'),

  findAll: async ({
    filter = {},
    sort = { createdAt: -1 },
    page = 1,
    limit = PAGINATION.DEFAULT_LIMIT,
  }) => {
    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('customer', 'name email avatar')
        .populate('vehicle', 'make model images')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(filter),
    ]);
    return { bookings, total };
  },

  findByCustomer: async (customerId, filter = {}, page = 1, limit = PAGINATION.DEFAULT_LIMIT) => {
    const skip = (page - 1) * limit;
    const baseFilter = { customer: customerId, ...filter };
    const [bookings, total] = await Promise.all([
      Booking.find(baseFilter)
        .populate('vehicle', 'make model images pricing location')
        .populate('owner', 'name phone businessName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(baseFilter),
    ]);
    return { bookings, total };
  },

  findByOwner: async (ownerId, filter = {}, page = 1, limit = PAGINATION.DEFAULT_LIMIT) => {
    const skip = (page - 1) * limit;
    const baseFilter = { owner: ownerId, ...filter };
    const [bookings, total] = await Promise.all([
      Booking.find(baseFilter)
        .populate('customer', 'name email phone avatar')
        .populate('vehicle', 'make model images registrationNumber')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(baseFilter),
    ]);
    return { bookings, total };
  },

  countDocuments: (filter = {}) => Booking.countDocuments(filter),

  /**
   * Revenue aggregation pipeline for analytics.
   */
  revenueByMonth: (matchFilter = {}) =>
    Booking.aggregate([
      { $match: { status: BOOKING_STATUS.COMPLETED, ...matchFilter } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),

  bookingsByStatus: (matchFilter = {}) =>
    Booking.aggregate([
      { $match: matchFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
};
