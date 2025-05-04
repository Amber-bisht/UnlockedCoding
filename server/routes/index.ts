import express from 'express';
import authRoutes from './auth.routes';
import profileRoutes from './profile.routes';
import categoryRoutes from './category.routes';
import courseRoutes from './course.routes';
import lessonRoutes from './lesson.routes';
import adminRoutes from './admin.routes';
import notificationRoutes from './notification.routes';
import contactRoutes from './contact.routes';

const router = express.Router();

// Define API routes
router.use('/api', authRoutes);
router.use('/api/profile', profileRoutes);
router.use('/api/categories', categoryRoutes);
router.use('/api/courses', courseRoutes);
router.use('/api', lessonRoutes); // Using /api as base since lesson routes have complex paths
router.use('/api', adminRoutes); // Admin routes for dashboard functionality
router.use('/api', notificationRoutes); // Notification routes
router.use('/api/contact', contactRoutes); // Contact form submissions

export default router;