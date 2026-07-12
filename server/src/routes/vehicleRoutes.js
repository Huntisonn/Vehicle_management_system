// src/routes/vehicleRoutes.js
import { Router } from 'express';
import { vehicleController } from '../controllers/vehicleController.js';
import { authenticate, requireOwner, requireAdmin, optionalAuth } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { upload } from '../config/cloudinary.js';
import {
  createVehicleValidator,
  bookingDateValidator,
} from '../validators/vehicleValidators.js';

const router = Router();

// Public routes
router.get('/', bookingDateValidator, validate, optionalAuth, vehicleController.listVehicles);
router.get('/:id', vehicleController.getVehicleById);

// Protected: Owner
router.use(authenticate);
router.post('/', requireOwner, createVehicleValidator, validate, vehicleController.createVehicle);
router.put('/:id', requireOwner, vehicleController.updateVehicle);
router.delete('/:id', requireOwner, vehicleController.deleteVehicle);
router.post('/:id/images', requireOwner, upload.array('images', 10), vehicleController.uploadImages);
router.delete('/:id/images', requireOwner, vehicleController.deleteImage);

// Owner fleet
router.get('/owner/fleet', requireOwner, vehicleController.getOwnerFleet);

// Admin moderation
router.patch('/:id/moderate', requireAdmin, vehicleController.moderateListing);

export default router;
