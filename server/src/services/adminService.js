// src/services/adminService.js
import { userRepository } from '../repositories/userRepository.js';
import { vehicleRepository } from '../repositories/vehicleRepository.js';
import { bookingRepository } from '../repositories/bookingRepository.js';
import { notificationService } from './notificationService.js';
import { sendEmail, emailTemplates } from '../utils/emailHelper.js';
import AppError from '../utils/AppError.js';
import { OWNER_STATUS, LISTING_STATUS, ROLES } from '../constants/index.js';
import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import Booking from '../models/Booking.js';

export const adminService = {
  /**
   * Admin dashboard aggregated stats.
   */
  getDashboardStats: async () => {
    const [
      totalUsers,
      totalOwners,
      totalVehicles,
      totalBookings,
      pendingOwners,
      pendingListings,
      revenueData,
    ] = await Promise.all([
      userRepository.countDocuments({ role: ROLES.CUSTOMER }),
      userRepository.countDocuments({ role: ROLES.OWNER }),
      vehicleRepository.countDocuments({ isDeleted: false }),
      bookingRepository.countDocuments({}),
      userRepository.countDocuments({ role: ROLES.OWNER, ownerStatus: OWNER_STATUS.PENDING }),
      vehicleRepository.countDocuments({ listingStatus: LISTING_STATUS.PENDING }),
      bookingRepository.revenueByMonth(),
    ]);

    const bookingStats = await bookingRepository.bookingsByStatus();

    return {
      totalUsers,
      totalOwners,
      totalVehicles,
      totalBookings,
      pendingOwners,
      pendingListings,
      revenueData,
      bookingStats,
    };
  },

  /**
   * Approve or reject an owner application.
   */
  moderateOwner: async (ownerId, action, reason) => {
    const user = await userRepository.findById(ownerId);
    if (!user || user.role !== ROLES.OWNER) throw new AppError('Owner not found', 404);

    const newStatus = action === 'approve' ? OWNER_STATUS.APPROVED : OWNER_STATUS.REJECTED;
    await userRepository.updateById(ownerId, { ownerStatus: newStatus });

    if (newStatus === OWNER_STATUS.APPROVED) {
      const { subject, html } = emailTemplates.ownerApproved(user.name);
      sendEmail({ to: user.email, subject, html });
      await notificationService.createNotification({
        recipientId: ownerId,
        type: 'owner_approved',
        title: 'Owner Account Approved',
        message: 'Your owner account has been approved. Start listing your vehicles!',
      });
    } else {
      await notificationService.createNotification({
        recipientId: ownerId,
        type: 'owner_rejected',
        title: 'Owner Application Rejected',
        message: reason || 'Your application has been rejected.',
      });
    }

    return userRepository.findById(ownerId);
  },

  /**
   * Block or unblock a user.
   */
  toggleBlockUser: async (userId, block) => {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    return userRepository.updateById(userId, { isBlocked: block });
  },

  /**
   * Soft-delete a user.
   */
  deleteUser: async (userId) => {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    return userRepository.deleteById(userId);
  },

  /**
   * Get all users with filtering/pagination.
   */
  getUsers: (filter, page, limit) => userRepository.findAll({ filter, page, limit }),

  /**
   * Get all vehicles for admin.
   */
  getVehicles: (filter, page, limit) =>
    vehicleRepository.search({ filter, page, limit }),

  /**
   * Revenue analytics aggregation.
   */
  getRevenueAnalytics: () => bookingRepository.revenueByMonth(),

  /**
   * Top performing cities.
   */
  getTopCities: () =>
    Booking.aggregate([
      { $match: { status: 'completed' } },
      {
        $lookup: {
          from: 'vehicles',
          localField: 'vehicle',
          foreignField: '_id',
          as: 'vehicleData',
        },
      },
      { $unwind: '$vehicleData' },
      {
        $group: {
          _id: '$vehicleData.location.city',
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]),

  /**
   * Most popular vehicles.
   */
  getTopVehicles: () =>
    Vehicle.find({ listingStatus: 'approved', isDeleted: false })
      .sort({ totalRentals: -1 })
      .limit(10)
      .select('make model images totalRentals totalRevenue averageRating location'),
};
