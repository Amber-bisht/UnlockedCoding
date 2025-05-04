import express from 'express';
import authRoutes from './auth.routes';
import profileRoutes from './profile.routes';
import categoryRoutes from './category.routes';

const router = express.Router();

// Define API routes
router.use('/api', authRoutes);
router.use('/api/profile', profileRoutes);
router.use('/api/categories', categoryRoutes);

export default router;