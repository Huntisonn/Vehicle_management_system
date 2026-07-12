// src/routes/adminRoutes.js
import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(authenticate, requireAdmin);

router.get('/dashboard', adminController.getDashboard);
router.get('/analytics', adminController.getAnalytics);

router.get('/users', adminController.getUsers);
router.patch('/users/:id/block', adminController.toggleBlockUser);
router.delete('/users/:id', adminController.deleteUser);

router.get('/owners', adminController.getUsers);   // same endpoint, filter by role=owner
router.patch('/owners/:id/moderate', adminController.moderateOwner);

router.get('/vehicles', adminController.getVehicles);

export default router;
