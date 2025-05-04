import express from 'express';
import authRoutes from './auth.routes';
import profileRoutes from './profile.routes';
import categoryRoutes from './category.routes';
import courseRoutes from './course.routes';
import lessonRoutes from './lesson.routes';
import adminRoutes from './admin.routes';

const router = express.Router();

// Define API routes
router.use('/api', authRoutes);
router.use('/api/profile', profileRoutes);
router.use('/api/categories', categoryRoutes);
router.use('/api/courses', courseRoutes);
router.use('/api', lessonRoutes); // Using /api as base since lesson routes have complex paths
router.use('/api', adminRoutes); // Admin routes for dashboard functionality

export default router;