// src/routes/bookingRoutes.js
import { Router } from 'express';
import { bookingController } from '../controllers/bookingController.js';
import { authenticate, requireAdmin, requireOwner } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import {
  createBookingValidator,
  cancelBookingValidator,
  rejectBookingValidator,
} from '../validators/bookingValidators.js';

const router = Router();

router.use(authenticate);

// Customer
router.post('/', createBookingValidator, validate, bookingController.createBooking);
router.get('/my', bookingController.getMyBookings);
router.get('/:id', bookingController.getBookingById);
router.post('/:id/cancel', cancelBookingValidator, validate, bookingController.cancelBooking);

// Owner
router.get('/owner/list', requireOwner, bookingController.getOwnerBookings);
router.post('/:id/approve', requireOwner, bookingController.approveBooking);
router.post('/:id/reject', requireOwner, rejectBookingValidator, validate, bookingController.rejectBooking);

// Admin
router.get('/admin/all', requireAdmin, bookingController.getAllBookings);
router.post('/:id/complete', requireAdmin, bookingController.completeBooking);

export default router;
