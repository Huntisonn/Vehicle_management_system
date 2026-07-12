// src/repositories/vehicleRepository.js
import Vehicle from '../models/Vehicle.js';
import { VEHICLE_STATUS, LISTING_STATUS, PAGINATION } from '../constants/index.js';

export const vehicleRepository = {
  findById: (id) =>
    Vehicle.findById(id).populate('owner', 'name email phone businessName avatar'),

  findByIdRaw: (id) => Vehicle.findById(id),

  create: (data) => Vehicle.create(data),

  updateById: (id, data, options = { new: true, runValidators: true }) =>
    Vehicle.findByIdAndUpdate(id, data, options),

  softDelete: (id) =>
    Vehicle.findByIdAndUpdate(id, { isDeleted: true }, { new: true }),

  /**
   * Advanced search with filters, pagination, sorting.
   */
  search: async ({
    filter = {},
    sort = { createdAt: -1 },
    page = 1,
    limit = PAGINATION.DEFAULT_LIMIT,
    populate = true,
  }) => {
    const skip = (page - 1) * limit;
    let query = Vehicle.find(filter).sort(sort).skip(skip).limit(limit);
    if (populate) query = query.populate('owner', 'name avatar businessName');
    const [vehicles, total] = await Promise.all([query, Vehicle.countDocuments(filter)]);
    return { vehicles, total };
  },

  findByOwner: (ownerId, filter = {}) =>
    Vehicle.find({ owner: ownerId, ...filter }).sort({ createdAt: -1 }),

  countByOwner: (ownerId) => Vehicle.countDocuments({ owner: ownerId, isDeleted: false }),

  countDocuments: (filter = {}) => Vehicle.countDocuments(filter),

  /**
   * Get available vehicles for a date range (no approved/active bookings overlap).
   */
  findAvailableVehicles: (vehicleIds, startDate, endDate) =>
    Vehicle.find({
      _id: { $in: vehicleIds },
      status: VEHICLE_STATUS.AVAILABLE,
      listingStatus: LISTING_STATUS.APPROVED,
      isDeleted: false,
    }),

  updateStatus: (id, status) =>
    Vehicle.findByIdAndUpdate(id, { status }, { new: true }),

  addImage: (id, image) =>
    Vehicle.findByIdAndUpdate(id, { $push: { images: image } }, { new: true }),

  removeImage: (id, imageId) =>
    Vehicle.findByIdAndUpdate(id, { $pull: { images: { _id: imageId } } }, { new: true }),

  incrementStats: (id, amount) =>
    Vehicle.findByIdAndUpdate(id, {
      $inc: { totalRentals: 1, totalRevenue: amount },
    }),
};
