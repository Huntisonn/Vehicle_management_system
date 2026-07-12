// src/controllers/userController.js
import { userRepository } from '../repositories/userRepository.js';
import { notificationService } from '../services/notificationService.js';
import { cloudinary } from '../config/cloudinary.js';
import { sendSuccess, paginationMeta } from '../utils/apiResponse.js';
import AppError from '../utils/AppError.js';
import { StatusCodes } from 'http-status-codes';

export const userController = {
  getProfile: async (req, res) => {
    const user = await userRepository.findById(req.user._id);
    sendSuccess(res, StatusCodes.OK, 'Profile fetched', user);
  },

  updateProfile: async (req, res) => {
    const { name, phone, address, businessName, businessAddress } = req.body;
    const user = await userRepository.updateById(req.user._id, {
      name,
      phone,
      address,
      businessName,
      businessAddress,
    });
    sendSuccess(res, StatusCodes.OK, 'Profile updated', user);
  },

  uploadAvatar: async (req, res) => {
    if (!req.file) throw new AppError('No file uploaded', 400);

    // Remove old avatar from Cloudinary
    const currentUser = await userRepository.findById(req.user._id);
    if (currentUser.avatar?.publicId) {
      await cloudinary.uploader.destroy(currentUser.avatar.publicId);
    }

    const user = await userRepository.updateById(req.user._id, {
      avatar: { url: req.file.path, publicId: req.file.filename },
    });
    sendSuccess(res, StatusCodes.OK, 'Avatar updated', user);
  },

  getWishlist: async (req, res) => {
    const user = await userRepository.findById(req.user._id);
    const populated = await user.populate('wishlist', 'make model images pricing location averageRating');
    sendSuccess(res, StatusCodes.OK, 'Wishlist fetched', populated.wishlist);
  },

  toggleWishlist: async (req, res) => {
    const { vehicleId } = req.params;
    const user = await userRepository.findById(req.user._id);
    const isInWishlist = user.wishlist.some((id) => id.toString() === vehicleId);

    if (isInWishlist) {
      await userRepository.removeFromWishlist(req.user._id, vehicleId);
      return sendSuccess(res, StatusCodes.OK, 'Removed from wishlist');
    }
    await userRepository.addToWishlist(req.user._id, vehicleId);
    sendSuccess(res, StatusCodes.OK, 'Added to wishlist');
  },

  getNotifications: async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const result = await notificationService.getUserNotifications(
      req.user._id,
      Number(page),
      Number(limit)
    );
    sendSuccess(res, StatusCodes.OK, 'Notifications fetched', result);
  },

  markNotificationRead: async (req, res) => {
    await notificationService.markAsRead(req.params.id, req.user._id);
    sendSuccess(res, StatusCodes.OK, 'Notification marked as read');
  },

  markAllNotificationsRead: async (req, res) => {
    await notificationService.markAllAsRead(req.user._id);
    sendSuccess(res, StatusCodes.OK, 'All notifications marked as read');
  },

  // Owner dashboard stats
  getOwnerDashboard: async (req, res) => {
    const { bookingRepository } = await import('../repositories/bookingRepository.js');
    const { vehicleRepository } = await import('../repositories/vehicleRepository.js');

    const [vehicles, bookingStats, revenueData] = await Promise.all([
      vehicleRepository.findByOwner(req.user._id),
      bookingRepository.bookingsByStatus({ owner: req.user._id }),
      bookingRepository.revenueByMonth({ owner: req.user._id }),
    ]);

    const totalRevenue = vehicles.reduce((sum, v) => sum + v.totalRevenue, 0);

    sendSuccess(res, StatusCodes.OK, 'Owner dashboard fetched', {
      vehicles: { total: vehicles.length, list: vehicles },
      bookingStats,
      revenueData,
      totalRevenue,
    });
  },
};
