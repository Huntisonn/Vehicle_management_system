// src/validators/vehicleValidators.js
import { body, query } from 'express-validator';
import { VEHICLE_TYPE, FUEL_TYPE, TRANSMISSION } from '../constants/index.js';

export const createVehicleValidator = [
  body('make').trim().notEmpty().withMessage('Make is required'),
  body('model').trim().notEmpty().withMessage('Model is required'),
  body('vehicleType')
    .isIn(Object.values(VEHICLE_TYPE))
    .withMessage('Invalid vehicle type'),
  body('fuelType').isIn(Object.values(FUEL_TYPE)).withMessage('Invalid fuel type'),
  body('transmission')
    .isIn(Object.values(TRANSMISSION))
    .withMessage('Invalid transmission type'),
  body('registrationNumber').trim().notEmpty().withMessage('Registration number is required'),
  body('location.city').trim().notEmpty().withMessage('City is required'),
  body('pricing.daily')
    .isFloat({ min: 0 })
    .withMessage('Daily price must be a positive number'),
  body('pricing.weekly').optional().isFloat({ min: 0 }),
  body('pricing.monthly').optional().isFloat({ min: 0 }),
  body('pricing.securityDeposit').optional().isFloat({ min: 0 }),
];

export const bookingDateValidator = [
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date'),
];
