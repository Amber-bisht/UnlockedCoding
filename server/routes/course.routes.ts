import express from 'express';
import { courseController } from '../controllers';
import { isAdmin, isAuthenticated } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);

// Admin routes
router.post('/', isAdmin, courseController.createCourse);
router.put('/:id', isAdmin, courseController.updateCourse);
router.delete('/:id', isAdmin, courseController.deleteCourse);

export default router;