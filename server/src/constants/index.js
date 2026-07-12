// src/constants/index.js
// Central barrel for all application constants

export const ROLES = Object.freeze({
  CUSTOMER: 'customer',
  OWNER: 'owner',
  ADMIN: 'admin',
});

export const BOOKING_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
});

export const VEHICLE_STATUS = Object.freeze({
  AVAILABLE: 'available',
  RENTED: 'rented',
  MAINTENANCE: 'maintenance',
  INACTIVE: 'inactive',
});

export const VEHICLE_TYPE = Object.freeze({
  CAR: 'car',
  BIKE: 'bike',
  SCOOTER: 'scooter',
  TRUCK: 'truck',
  VAN: 'van',
  SUV: 'suv',
});

export const FUEL_TYPE = Object.freeze({
  PETROL: 'petrol',
  DIESEL: 'diesel',
  ELECTRIC: 'electric',
  HYBRID: 'hybrid',
  CNG: 'cng',
});

export const TRANSMISSION = Object.freeze({
  MANUAL: 'manual',
  AUTOMATIC: 'automatic',
});

export const RENTAL_TYPE = Object.freeze({
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
});

export const OWNER_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
});

export const LISTING_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
});

export const NOTIFICATION_TYPES = Object.freeze({
  BOOKING_CREATED: 'booking_created',
  BOOKING_APPROVED: 'booking_approved',
  BOOKING_REJECTED: 'booking_rejected',
  BOOKING_CANCELLED: 'booking_cancelled',
  BOOKING_COMPLETED: 'booking_completed',
  PAYMENT_RECEIVED: 'payment_received',
  REVIEW_RECEIVED: 'review_received',
  OWNER_APPROVED: 'owner_approved',
  OWNER_REJECTED: 'owner_rejected',
  LISTING_APPROVED: 'listing_approved',
  LISTING_REJECTED: 'listing_rejected',
  MAINTENANCE_DUE: 'maintenance_due',
  PROMO_CODE: 'promo_code',
});

export const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
});

export const CACHE_KEYS = Object.freeze({
  VEHICLES: 'vehicles',
  VEHICLE: 'vehicle',
  BOOKINGS: 'bookings',
  USERS: 'users',
  ANALYTICS: 'analytics',
});

export const AUDIT_ACTIONS = Object.freeze({
  LOGIN: 'login',
  LOGOUT: 'logout',
  REGISTER: 'register',
  UPDATE_PROFILE: 'update_profile',
  CHANGE_PASSWORD: 'change_password',
  CREATE_BOOKING: 'create_booking',
  CANCEL_BOOKING: 'cancel_booking',
  APPROVE_BOOKING: 'approve_booking',
  REJECT_BOOKING: 'reject_booking',
  ADD_VEHICLE: 'add_vehicle',
  UPDATE_VEHICLE: 'update_vehicle',
  DELETE_VEHICLE: 'delete_vehicle',
  APPROVE_OWNER: 'approve_owner',
  REJECT_OWNER: 'reject_owner',
  BLOCK_USER: 'block_user',
  DELETE_USER: 'delete_user',
});
