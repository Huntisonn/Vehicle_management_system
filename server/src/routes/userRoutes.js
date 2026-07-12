// src/routes/userRoutes.js
import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { authenticate, requireOwner } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = Router();
router.use(authenticate);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.post('/avatar', upload.single('avatar'), userController.uploadAvatar);

router.get('/wishlist', userController.getWishlist);
router.post('/wishlist/:vehicleId', userController.toggleWishlist);
router.delete('/wishlist/:vehicleId', userController.toggleWishlist);

router.get('/notifications', userController.getNotifications);
router.patch('/notifications/:id/read', userController.markNotificationRead);
router.patch('/notifications/read-all', userController.markAllNotificationsRead);

// Owner dashboard
router.get('/owner/dashboard', requireOwner, userController.getOwnerDashboard);

export default router;
