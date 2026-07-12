// src/controllers/vehicleController.js
import { vehicleService } from '../services/vehicleService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { paginationMeta } from '../utils/apiResponse.js';
import { StatusCodes } from 'http-status-codes';

export const vehicleController = {
  listVehicles: async (req, res) => {
    const { vehicles, total } = await vehicleService.listVehicles(req.query);
    const { page = 1, limit = 10 } = req.query;
    sendSuccess(
      res,
      StatusCodes.OK,
      'Vehicles fetched',
      vehicles,
      paginationMeta(total, page, limit)
    );
  },

  getVehicleById: async (req, res) => {
    const result = await vehicleService.getVehicleById(req.params.id);
    sendSuccess(res, StatusCodes.OK, 'Vehicle fetched', result);
  },

  createVehicle: async (req, res) => {
    const vehicle = await vehicleService.createVehicle(req.body, req.user);
    sendSuccess(res, StatusCodes.CREATED, 'Vehicle created', vehicle);
  },

  updateVehicle: async (req, res) => {
    const vehicle = await vehicleService.updateVehicle(req.params.id, req.body, req.user);
    sendSuccess(res, StatusCodes.OK, 'Vehicle updated', vehicle);
  },

  deleteVehicle: async (req, res) => {
    await vehicleService.deleteVehicle(req.params.id, req.user);
    sendSuccess(res, StatusCodes.OK, 'Vehicle deleted');
  },

  uploadImages: async (req, res) => {
    const vehicle = await vehicleService.uploadImages(req.params.id, req.files, req.user);
    sendSuccess(res, StatusCodes.OK, 'Images uploaded', vehicle);
  },

  deleteImage: async (req, res) => {
    const { imageId, publicId } = req.body;
    const vehicle = await vehicleService.deleteImage(req.params.id, imageId, publicId, req.user);
    sendSuccess(res, StatusCodes.OK, 'Image deleted', vehicle);
  },

  moderateListing: async (req, res) => {
    const { action, reason } = req.body;
    const vehicle = await vehicleService.moderateListing(req.params.id, action, reason);
    sendSuccess(res, StatusCodes.OK, `Vehicle listing ${action}d`, vehicle);
  },

  getOwnerFleet: async (req, res) => {
    const result = await vehicleService.getOwnerFleetStats(req.user._id);
    sendSuccess(res, StatusCodes.OK, 'Fleet fetched', result);
  },
};
