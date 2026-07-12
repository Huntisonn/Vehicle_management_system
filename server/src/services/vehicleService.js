// src/services/vehicleService.js
import { vehicleRepository } from '../repositories/vehicleRepository.js';
import { bookingRepository } from '../repositories/bookingRepository.js';
import { cloudinary } from '../config/cloudinary.js';
import AppError from '../utils/AppError.js';
import fs from 'fs';
import path from 'path';
import {
  VEHICLE_STATUS,
  LISTING_STATUS,
  OWNER_STATUS,
  BOOKING_STATUS,
  PAGINATION,
} from '../constants/index.js';

export const vehicleService = {
  /**
   * List / search vehicles with full filter support.
   */
  listVehicles: async (query) => {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = Math.min(query.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT),
      sort = '-createdAt',
      vehicleType,
      fuelType,
      transmission,
      city,
      minPrice,
      maxPrice,
      startDate,
      endDate,
      search,
    } = query;

    const filter = {
      listingStatus: LISTING_STATUS.APPROVED,
      status: VEHICLE_STATUS.AVAILABLE,
      isDeleted: false,
    };

    if (vehicleType) filter.vehicleType = vehicleType;
    if (fuelType) filter.fuelType = fuelType;
    if (transmission) filter.transmission = transmission;
    if (city) filter['location.city'] = { $regex: city, $options: 'i' };
    if (minPrice || maxPrice) {
      filter['pricing.daily'] = {};
      if (minPrice) filter['pricing.daily'].$gte = Number(minPrice);
      if (maxPrice) filter['pricing.daily'].$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [
        { make: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
      ];
    }

    const sortMap = { '-createdAt': { createdAt: -1 }, price_asc: { 'pricing.daily': 1 }, price_desc: { 'pricing.daily': -1 }, rating: { averageRating: -1 } };
    const sortObj = sortMap[sort] || { createdAt: -1 };

    let result = await vehicleRepository.search({ filter, sort: sortObj, page, limit });

    // If date range given, filter out vehicles with conflicting bookings
    if (startDate && endDate) {
      const vehicleIds = result.vehicles.map((v) => v._id);
      const conflictingBookings = await bookingRepository.findAll({
        filter: {
          vehicle: { $in: vehicleIds },
          status: { $in: [BOOKING_STATUS.APPROVED, BOOKING_STATUS.ACTIVE] },
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) },
        },
        page: 1,
        limit: 1000,
      });
      const bookedVehicleIds = new Set(
        conflictingBookings.bookings.map((b) => b.vehicle._id?.toString() || b.vehicle.toString())
      );
      result.vehicles = result.vehicles.filter((v) => !bookedVehicleIds.has(v._id.toString()));
      result.total = result.vehicles.length;
    }

    return result;
  },

  /**
   * Get single vehicle with booked dates.
   */
  getVehicleById: async (id) => {
    const vehicle = await vehicleRepository.findById(id);
    if (!vehicle) throw new AppError('Vehicle not found', 404);

    const bookedDates = await bookingRepository.getBookedDates(id);
    return { vehicle, bookedDates };
  },

  /**
   * Create a new vehicle listing (owner only).
   * Owner must be approved.
   */
  createVehicle: async (data, owner) => {
    if (owner.ownerStatus !== OWNER_STATUS.APPROVED) {
      throw new AppError('Your owner account is not yet approved', 403);
    }
    const vehicle = await vehicleRepository.create({ ...data, owner: owner._id });
    return vehicle;
  },

  /**
   * Update vehicle — only owner or admin.
   */
  updateVehicle: async (vehicleId, data, requestingUser) => {
    const vehicle = await vehicleRepository.findByIdRaw(vehicleId);
    if (!vehicle) throw new AppError('Vehicle not found', 404);

    const isOwner = vehicle.owner.toString() === requestingUser._id.toString();
    const isAdmin = requestingUser.role === 'admin';
    if (!isOwner && !isAdmin) throw new AppError('Not authorised', 403);

    Object.assign(vehicle, data);
    await vehicle.save();
    return vehicle;
  },

  /**
   * Soft-delete vehicle.
   */
  deleteVehicle: async (vehicleId, requestingUser) => {
    const vehicle = await vehicleRepository.findByIdRaw(vehicleId);
    if (!vehicle) throw new AppError('Vehicle not found', 404);

    const isOwner = vehicle.owner.toString() === requestingUser._id.toString();
    const isAdmin = requestingUser.role === 'admin';
    if (!isOwner && !isAdmin) throw new AppError('Not authorised', 403);

    await vehicleRepository.softDelete(vehicleId);
  },

  /**
   * Upload images to Cloudinary — files already uploaded by multer middleware.
   */
  uploadImages: async (vehicleId, files, requestingUser) => {
    const vehicle = await vehicleRepository.findByIdRaw(vehicleId);
    if (!vehicle) throw new AppError('Vehicle not found', 404);

    const isOwner = vehicle.owner.toString() === requestingUser._id.toString();
    if (!isOwner && requestingUser.role !== 'admin') throw new AppError('Not authorised', 403);

    const isCloudinary = files[0]?.path?.startsWith('http');
    const images = files.map((f, i) => ({
      url: isCloudinary ? f.path : `/uploads/${f.filename}`,
      publicId: f.filename,
      isPrimary: vehicle.images.length === 0 && i === 0,
    }));

    for (const img of images) {
      await vehicleRepository.addImage(vehicleId, img);
    }

    return vehicleRepository.findById(vehicleId);
  },

  /**
   * Delete a single image from Cloudinary + DB.
   */
  deleteImage: async (vehicleId, imageId, publicId, requestingUser) => {
    const vehicle = await vehicleRepository.findByIdRaw(vehicleId);
    if (!vehicle) throw new AppError('Vehicle not found', 404);

    const isOwner = vehicle.owner.toString() === requestingUser._id.toString();
    if (!isOwner && requestingUser.role !== 'admin') throw new AppError('Not authorised', 403);

    const isCloudinary = publicId && (publicId.startsWith('http') || !fs.existsSync(path.join(process.cwd(), 'src', 'uploads', publicId)));
    if (isCloudinary) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        // Log error but don't crash
      }
    } else if (publicId) {
      const pathModule = await import('path');
      const fsModule = await import('fs');
      const localPath = pathModule.join(process.cwd(), 'src', 'uploads', publicId);
      if (fsModule.default.existsSync(localPath)) {
        try {
          fsModule.default.unlinkSync(localPath);
        } catch (err) {
          // Log error but don't crash
        }
      }
    }
    return vehicleRepository.removeImage(vehicleId, imageId);
  },

  /**
   * Admin: approve or reject a listing.
   */
  moderateListing: async (vehicleId, action, reason) => {
    const status = action === 'approve' ? LISTING_STATUS.APPROVED : LISTING_STATUS.REJECTED;
    const update = { listingStatus: status };
    if (status === LISTING_STATUS.REJECTED) update.rejectionReason = reason;
    const vehicle = await vehicleRepository.updateById(vehicleId, update);
    if (!vehicle) throw new AppError('Vehicle not found', 404);
    return vehicle;
  },

  /**
   * Owner: get their fleet stats.
   */
  getOwnerFleetStats: async (ownerId) => {
    const vehicles = await vehicleRepository.findByOwner(ownerId);
    const stats = vehicles.reduce(
      (acc, v) => {
        acc.total++;
        acc[v.status] = (acc[v.status] || 0) + 1;
        acc.totalRevenue += v.totalRevenue;
        return acc;
      },
      { total: 0, totalRevenue: 0 }
    );
    return { vehicles, stats };
  },
};
