// src/validators/bookingValidators.js
import { body } from 'express-validator';

export const createBookingValidator = [
  body('vehicleId').isMongoId().withMessage('Invalid vehicle ID'),
  body('startDate').isISO8601().withMessage('Invalid start date').toDate(),
  body('endDate')
    .isISO8601()
    .withMessage('Invalid end date')
    .toDate()
    .custom((endDate, { req }) => {
      if (endDate <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes too long'),
  body('promoCode').optional().trim().isAlphanumeric().withMessage('Invalid promo code'),
];

export const cancelBookingValidator = [
  body('reason').optional().isLength({ max: 500 }).withMessage('Reason too long'),
];

export const rejectBookingValidator = [
  body('reason').trim().notEmpty().withMessage('Rejection reason is required'),
];
