// src/controllers/bookingController.js
import { bookingService } from '../services/bookingService.js';
import { sendSuccess, paginationMeta } from '../utils/apiResponse.js';
import { StatusCodes } from 'http-status-codes';
import { BOOKING_STATUS } from '../constants/index.js';

export const bookingController = {
  createBooking: async (req, res) => {
    const booking = await bookingService.createBooking(req.body, req.user);
    sendSuccess(res, StatusCodes.CREATED, 'Booking created successfully', booking);
  },

  getBookingById: async (req, res) => {
    const booking = await bookingService.getBookingById(req.params.id, req.user);
    sendSuccess(res, StatusCodes.OK, 'Booking fetched', booking);
  },

  getMyBookings: async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = status ? { status } : {};
    const { bookings, total } = await bookingService.getCustomerBookings(
      req.user._id,
      filter,
      Number(page),
      Number(limit)
    );
    sendSuccess(res, StatusCodes.OK, 'Bookings fetched', bookings, paginationMeta(total, page, limit));
  },

  getOwnerBookings: async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = status ? { status } : {};
    const { bookings, total } = await bookingService.getOwnerBookings(
      req.user._id,
      filter,
      Number(page),
      Number(limit)
    );
    sendSuccess(res, StatusCodes.OK, 'Bookings fetched', bookings, paginationMeta(total, page, limit));
  },

  getAllBookings: async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = status ? { status } : {};
    const { bookings, total } = await bookingService.getAllBookings(
      filter,
      Number(page),
      Number(limit)
    );
    sendSuccess(res, StatusCodes.OK, 'All bookings fetched', bookings, paginationMeta(total, page, limit));
  },

  approveBooking: async (req, res) => {
    const booking = await bookingService.approveBooking(req.params.id, req.user);
    sendSuccess(res, StatusCodes.OK, 'Booking approved', booking);
  },

  rejectBooking: async (req, res) => {
    const booking = await bookingService.rejectBooking(
      req.params.id,
      req.user,
      req.body.reason
    );
    sendSuccess(res, StatusCodes.OK, 'Booking rejected', booking);
  },

  cancelBooking: async (req, res) => {
    const booking = await bookingService.cancelBooking(
      req.params.id,
      req.user,
      req.body.reason
    );
    sendSuccess(res, StatusCodes.OK, 'Booking cancelled', booking);
  },

  completeBooking: async (req, res) => {
    const booking = await bookingService.completeBooking(req.params.id);
    sendSuccess(res, StatusCodes.OK, 'Booking completed', booking);
  },
};
