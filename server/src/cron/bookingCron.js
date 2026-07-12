// src/cron/bookingCron.js
// Cron jobs for automated booking lifecycle management
import cron from 'node-cron';
import Booking from '../models/Booking.js';
import { bookingService } from '../services/bookingService.js';
import { vehicleRepository } from '../repositories/vehicleRepository.js';
import { BOOKING_STATUS, VEHICLE_STATUS } from '../constants/index.js';
import logger from '../utils/logger.js';

/**
 * Every hour: activate approved bookings whose startDate has passed.
 */
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    const toActivate = await Booking.find({
      status: BOOKING_STATUS.APPROVED,
      startDate: { $lte: now },
    });

    for (const booking of toActivate) {
      await Booking.findByIdAndUpdate(booking._id, {
        status: BOOKING_STATUS.ACTIVE,
        startedAt: now,
      });
      await vehicleRepository.updateStatus(booking.vehicle, VEHICLE_STATUS.RENTED);
      logger.info(`Booking ${booking._id} activated`);
    }
  } catch (err) {
    logger.error('Cron activate bookings error:', err);
  }
});

/**
 * Every hour: complete active bookings whose endDate has passed.
 */
cron.schedule('30 * * * *', async () => {
  try {
    const now = new Date();
    const toComplete = await Booking.find({
      status: BOOKING_STATUS.ACTIVE,
      endDate: { $lte: now },
    });

    for (const booking of toComplete) {
      await bookingService.completeBooking(booking._id.toString());
      logger.info(`Booking ${booking._id} auto-completed`);
    }
  } catch (err) {
    logger.error('Cron complete bookings error:', err);
  }
});

/**
 * Daily at midnight: expire pending bookings older than 48h (auto-reject).
 */
cron.schedule('0 0 * * *', async () => {
  try {
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const result = await Booking.updateMany(
      { status: BOOKING_STATUS.PENDING, createdAt: { $lt: cutoff } },
      { status: BOOKING_STATUS.CANCELLED, cancellationReason: 'Auto-cancelled: no response from owner' }
    );
    if (result.modifiedCount > 0) {
      logger.info(`Auto-cancelled ${result.modifiedCount} stale pending bookings`);
    }
  } catch (err) {
    logger.error('Cron auto-cancel error:', err);
  }
});

logger.info('✅ Booking cron jobs registered');
