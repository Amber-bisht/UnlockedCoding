import express from 'express';
import { notificationController } from '../controllers';
import { isAdmin, isAuthenticated } from '../middleware/auth.middleware';

const router = express.Router();

// Regular user routes
router.get('/notifications', isAuthenticated, notificationController.getAllNotifications);
router.get('/notifications/unread', isAuthenticated, notificationController.getUnreadNotifications);
router.patch('/notifications/:notificationId/read', isAuthenticated, notificationController.markNotificationAsRead);
router.patch('/notifications/read-all', isAuthenticated, notificationController.markAllNotificationsAsRead);

// Admin routes
router.post('/admin/notifications', isAuthenticated, notificationController.createNotification);
router.delete('/admin/notifications/:notificationId', isAuthenticated, isAdmin, notificationController.deleteNotification);

export default router;