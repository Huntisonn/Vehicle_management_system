// src/controllers/adminController.js
import { adminService } from '../services/adminService.js';
import { sendSuccess, paginationMeta } from '../utils/apiResponse.js';
import { StatusCodes } from 'http-status-codes';

export const adminController = {
  getDashboard: async (req, res) => {
    const stats = await adminService.getDashboardStats();
    sendSuccess(res, StatusCodes.OK, 'Dashboard stats fetched', stats);
  },

  getUsers: async (req, res) => {
    const { role, isBlocked, page = 1, limit = 10, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isBlocked !== undefined) filter.isBlocked = isBlocked === 'true';
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];

    const { users, total } = await adminService.getUsers(filter, Number(page), Number(limit));
    sendSuccess(res, StatusCodes.OK, 'Users fetched', users, paginationMeta(total, page, limit));
  },

  moderateOwner: async (req, res) => {
    const { action, reason } = req.body;
    const user = await adminService.moderateOwner(req.params.id, action, reason);
    sendSuccess(res, StatusCodes.OK, `Owner ${action}d`, user);
  },

  toggleBlockUser: async (req, res) => {
    const { block } = req.body;
    const user = await adminService.toggleBlockUser(req.params.id, block);
    sendSuccess(res, StatusCodes.OK, `User ${block ? 'blocked' : 'unblocked'}`, user);
  },

  deleteUser: async (req, res) => {
    await adminService.deleteUser(req.params.id);
    sendSuccess(res, StatusCodes.OK, 'User deleted');
  },

  getVehicles: async (req, res) => {
    const { listingStatus, page = 1, limit = 10 } = req.query;
    const filter = listingStatus ? { listingStatus } : {};
    const { vehicles, total } = await adminService.getVehicles(filter, Number(page), Number(limit));
    sendSuccess(res, StatusCodes.OK, 'Vehicles fetched', vehicles, paginationMeta(total, page, limit));
  },

  getAnalytics: async (req, res) => {
    const [revenue, topCities, topVehicles] = await Promise.all([
      adminService.getRevenueAnalytics(),
      adminService.getTopCities(),
      adminService.getTopVehicles(),
    ]);
    sendSuccess(res, StatusCodes.OK, 'Analytics fetched', { revenue, topCities, topVehicles });
  },
};
