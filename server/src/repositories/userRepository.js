// src/repositories/userRepository.js
import User from '../models/User.js';
import { PAGINATION } from '../constants/index.js';

export const userRepository = {
  findById: (id, select = '') => User.findById(id).select(select),

  findByEmail: (email, select = '') =>
    User.findOne({ email: email.toLowerCase() }).select(select),

  findOne: (filter, select = '') => User.findOne(filter).select(select),

  create: (data) => User.create(data),

  updateById: (id, data, options = { new: true, runValidators: true }) =>
    User.findByIdAndUpdate(id, data, options),

  deleteById: (id) =>
    User.findByIdAndUpdate(id, { isDeleted: true, isBlocked: true }, { new: true }),

  /**
   * Paginated list with optional filter / sort.
   */
  findAll: async ({ filter = {}, sort = { createdAt: -1 }, page = 1, limit = PAGINATION.DEFAULT_LIMIT }) => {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filter).sort(sort).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);
    return { users, total };
  },

  countDocuments: (filter = {}) => User.countDocuments(filter),

  addToWishlist: (userId, vehicleId) =>
    User.findByIdAndUpdate(userId, { $addToSet: { wishlist: vehicleId } }, { new: true }),

  removeFromWishlist: (userId, vehicleId) =>
    User.findByIdAndUpdate(userId, { $pull: { wishlist: vehicleId } }, { new: true }),

  pushRefreshToken: (userId, token) =>
    User.findByIdAndUpdate(userId, { $push: { refreshTokens: token } }),

  pullRefreshToken: (userId, token) =>
    User.findByIdAndUpdate(userId, { $pull: { refreshTokens: token } }),

  clearRefreshTokens: (userId) =>
    User.findByIdAndUpdate(userId, { $set: { refreshTokens: [] } }),
};
