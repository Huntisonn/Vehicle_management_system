// src/services/bookingService.js
import { bookingRepository } from '../repositories/bookingRepository.js';
import { vehicleRepository } from '../repositories/vehicleRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { notificationService } from './notificationService.js';
import AppError from '../utils/AppError.js';
import {
  BOOKING_STATUS,
  VEHICLE_STATUS,
  RENTAL_TYPE,
  PAGINATION,
} from '../constants/index.js';

/** Calculate total amount based on rental type and days. */
const calculateAmount = (pricing, totalDays) => {
  let base;
  let rentalType;

  if (totalDays >= 28) {
    rentalType = RENTAL_TYPE.MONTHLY;
    const months = Math.ceil(totalDays / 28);
    base = (pricing.monthly || pricing.daily * 25) * months;
  } else if (totalDays >= 7) {
    rentalType = RENTAL_TYPE.WEEKLY;
    const weeks = Math.ceil(totalDays / 7);
    base = (pricing.weekly || pricing.daily * 6) * weeks;
  } else {
    rentalType = RENTAL_TYPE.DAILY;
    base = pricing.daily * totalDays;
  }

  const taxRate = 0.18; // 18% GST
  const taxAmount = Math.round(base * taxRate);
  const securityDeposit = pricing.securityDeposit || 0;
  const totalAmount = base + taxAmount + securityDeposit;

  return { base, taxAmount, securityDeposit, totalAmount, rentalType };
};

export const bookingService = {
  /**
   * Create a new booking with double-booking prevention.
   */
  createBooking: async ({ vehicleId, startDate, endDate, notes, promoCode }, customer) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) throw new AppError('End date must be after start date', 400);
    if (start < new Date()) throw new AppError('Start date cannot be in the past', 400);

    // 1. Verify vehicle exists and is available
    const vehicle = await vehicleRepository.findById(vehicleId);
    if (!vehicle) throw new AppError('Vehicle not found', 404);
    if (vehicle.status !== VEHICLE_STATUS.AVAILABLE) {
      throw new AppError(`Vehicle is currently ${vehicle.status}`, 400);
    }
    if (vehicle.listingStatus !== 'approved') {
      throw new AppError('Vehicle listing is not approved', 400);
    }

    // 2. Double-booking check (the core constraint)
    const conflicts = await bookingRepository.findConflictingBookings(vehicleId, start, end);
    if (conflicts.length > 0) {
      throw new AppError(
        'Vehicle is not available for the selected dates. Please choose different dates.',
        409
      );
    }

    // 3. Calculate pricing
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const { base, taxAmount, securityDeposit, totalAmount, rentalType } = calculateAmount(
      vehicle.pricing,
      totalDays
    );

    // 4. Apply promo code if provided
    let promoDiscount = 0;
    let promoCodeDoc = null;
    if (promoCode) {
      const PromoCode = (await import('../models/PromoCode.js')).default;
      promoCodeDoc = await PromoCode.findOne({ code: promoCode.toUpperCase(), isActive: true });
      if (promoCodeDoc?.isValid) {
        if (promoCodeDoc.discountType === 'percentage') {
          promoDiscount = Math.min(
            (base * promoCodeDoc.discountValue) / 100,
            promoCodeDoc.maxDiscount || Infinity
          );
        } else {
          promoDiscount = Math.min(promoCodeDoc.discountValue, base);
        }
        promoCodeDoc.usageCount += 1;
        promoCodeDoc.usedBy.push(customer._id);
        await promoCodeDoc.save();
      }
    }

    const finalTotal = Math.max(0, totalAmount - promoDiscount);

    // 5. Create booking
    const booking = await bookingRepository.create({
      customer: customer._id,
      vehicle: vehicleId,
      owner: vehicle.owner._id,
      startDate: start,
      endDate: end,
      totalDays,
      rentalType,
      priceSnapshot: { ...vehicle.pricing.toObject() },
      baseAmount: base,
      taxAmount,
      securityDeposit,
      discountAmount: promoDiscount,
      totalAmount: finalTotal,
      promoCode: promoCodeDoc?._id,
      promoDiscount,
      notes,
    });

    // 6. Notify owner
    await notificationService.createNotification({
      recipientId: vehicle.owner._id,
      type: 'booking_created',
      title: 'New Booking Request',
      message: `${customer.name} has requested to book your ${vehicle.make} ${vehicle.model}`,
      data: { bookingId: booking._id },
    });

    return bookingRepository.findById(booking._id);
  },

  /**
   * Owner approves a booking.
   */
  approveBooking: async (bookingId, owner) => {
    const booking = await bookingRepository.findByIdRaw(bookingId);
    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.owner.toString() !== owner._id.toString()) {
      throw new AppError('Not authorised', 403);
    }
    if (booking.status !== BOOKING_STATUS.PENDING) {
      throw new AppError(`Cannot approve a ${booking.status} booking`, 400);
    }

    // Re-check conflicts before approving (race condition guard)
    const conflicts = await bookingRepository.findConflictingBookings(
      booking.vehicle,
      booking.startDate,
      booking.endDate,
      bookingId
    );
    if (conflicts.length > 0) {
      throw new AppError('Another booking was approved for these dates', 409);
    }

    const updated = await bookingRepository.updateById(bookingId, {
      status: BOOKING_STATUS.APPROVED,
      approvedAt: new Date(),
    });

    await notificationService.createNotification({
      recipientId: booking.customer,
      type: 'booking_approved',
      title: 'Booking Approved! 🎉',
      message: `Your booking has been approved`,
      data: { bookingId },
    });

    return updated;
  },

  /**
   * Owner rejects a booking.
   */
  rejectBooking: async (bookingId, owner, reason) => {
    const booking = await bookingRepository.findByIdRaw(bookingId);
    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.owner.toString() !== owner._id.toString()) {
      throw new AppError('Not authorised', 403);
    }
    if (![BOOKING_STATUS.PENDING].includes(booking.status)) {
      throw new AppError(`Cannot reject a ${booking.status} booking`, 400);
    }

    const updated = await bookingRepository.updateById(bookingId, {
      status: BOOKING_STATUS.REJECTED,
      rejectionReason: reason,
    });

    await notificationService.createNotification({
      recipientId: booking.customer,
      type: 'booking_rejected',
      title: 'Booking Rejected',
      message: `Your booking was rejected: ${reason || 'No reason provided'}`,
      data: { bookingId },
    });

    return updated;
  },

  /**
   * Cancel booking (customer or owner or admin).
   */
  cancelBooking: async (bookingId, user, reason) => {
    const booking = await bookingRepository.findByIdRaw(bookingId);
    if (!booking) throw new AppError('Booking not found', 404);

    const isCustomer = booking.customer.toString() === user._id.toString();
    const isOwner = booking.owner.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';

    if (!isCustomer && !isOwner && !isAdmin) throw new AppError('Not authorised', 403);

    const cancellableStatuses = [BOOKING_STATUS.PENDING, BOOKING_STATUS.APPROVED];
    if (!cancellableStatuses.includes(booking.status)) {
      throw new AppError(`Cannot cancel a ${booking.status} booking`, 400);
    }

    const updated = await bookingRepository.updateById(bookingId, {
      status: BOOKING_STATUS.CANCELLED,
      cancellationReason: reason,
      cancelledBy: user._id,
      cancelledAt: new Date(),
    });

    const notifyId = isCustomer ? booking.owner : booking.customer;
    await notificationService.createNotification({
      recipientId: notifyId,
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      message: `A booking has been cancelled: ${reason || ''}`,
      data: { bookingId },
    });

    return updated;
  },

  /**
   * Complete a booking (admin or cron).
   */
  completeBooking: async (bookingId) => {
    const booking = await bookingRepository.findByIdRaw(bookingId);
    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.status !== BOOKING_STATUS.ACTIVE) {
      throw new AppError('Only active bookings can be completed', 400);
    }

    const [updated] = await Promise.all([
      bookingRepository.updateById(bookingId, {
        status: BOOKING_STATUS.COMPLETED,
        completedAt: new Date(),
        paymentStatus: 'paid',
      }),
      vehicleRepository.incrementStats(booking.vehicle, booking.totalAmount),
      vehicleRepository.updateStatus(booking.vehicle, VEHICLE_STATUS.AVAILABLE),
    ]);

    await notificationService.createNotification({
      recipientId: booking.customer,
      type: 'booking_completed',
      title: 'Rental Completed',
      message: 'Your rental has been completed. Please leave a review!',
      data: { bookingId, vehicleId: booking.vehicle },
    });

    return updated;
  },

  getCustomerBookings: (customerId, filter, page, limit) =>
    bookingRepository.findByCustomer(customerId, filter, page, limit),

  getOwnerBookings: (ownerId, filter, page, limit) =>
    bookingRepository.findByOwner(ownerId, filter, page, limit),

  getAllBookings: (filter, page, limit) =>
    bookingRepository.findAll({ filter, page, limit }),

  getBookingById: async (bookingId, user) => {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404);

    const isParty =
      booking.customer._id.toString() === user._id.toString() ||
      booking.owner._id.toString() === user._id.toString() ||
      user.role === 'admin';

    if (!isParty) throw new AppError('Not authorised', 403);
    return booking;
  },
};
