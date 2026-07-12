// src/services/api/index.js — API service layer (all fetch functions)
import api from '@/lib/axios';

// ─── Auth ─────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (d) => api.post('/auth/login', d),
  register: (d) => api.post('/auth/register', d),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  changePassword: (d) => api.post('/auth/change-password', d),
};

// ─── Vehicles ─────────────────────────────────────────────────────────────
export const vehicleAPI = {
  list: (params) => api.get('/vehicles', { params }),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (d) => api.post('/vehicles', d),
  update: (id, d) => api.put(`/vehicles/${id}`, d),
  delete: (id) => api.delete(`/vehicles/${id}`),
  uploadImages: (id, formData) =>
    api.post(`/vehicles/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteImage: (id, imageId, publicId) =>
    api.delete(`/vehicles/${id}/images`, { data: { imageId, publicId } }),
  getOwnerFleet: () => api.get('/vehicles/owner/fleet'),
  moderateListing: (id, action, reason) =>
    api.patch(`/vehicles/${id}/moderate`, { action, reason }),
};

// ─── Bookings ─────────────────────────────────────────────────────────────
export const bookingAPI = {
  create: (d) => api.post('/bookings', d),
  getById: (id) => api.get(`/bookings/${id}`),
  getMyBookings: (params) => api.get('/bookings/my', { params }),
  getOwnerBookings: (params) => api.get('/bookings/owner/list', { params }),
  getAllBookings: (params) => api.get('/bookings/admin/all', { params }),
  approve: (id) => api.post(`/bookings/${id}/approve`),
  reject: (id, reason) => api.post(`/bookings/${id}/reject`, { reason }),
  cancel: (id, reason) => api.post(`/bookings/${id}/cancel`, { reason }),
  complete: (id) => api.post(`/bookings/${id}/complete`),
};

// ─── Users ────────────────────────────────────────────────────────────────
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (d) => api.put('/users/profile', d),
  uploadAvatar: (formData) =>
    api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getWishlist: () => api.get('/users/wishlist'),
  toggleWishlist: (vehicleId) => api.post(`/users/wishlist/${vehicleId}`),
  getNotifications: (params) => api.get('/users/notifications', { params }),
  markNotificationRead: (id) => api.patch(`/users/notifications/${id}/read`),
  markAllRead: () => api.patch('/users/notifications/read-all'),
  getOwnerDashboard: () => api.get('/users/owner/dashboard'),
};

// ─── Admin ────────────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: (params) => api.get('/admin/users', { params }),
  moderateOwner: (id, action, reason) =>
    api.patch(`/admin/owners/${id}/moderate`, { action, reason }),
  toggleBlockUser: (id, block) => api.patch(`/admin/users/${id}/block`, { block }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getVehicles: (params) => api.get('/admin/vehicles', { params }),
};
