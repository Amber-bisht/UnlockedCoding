import express from 'express';
import { lessonController } from '../controllers';
import { isAdmin, isAuthenticated } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.get('/courses/:courseId/lessons', lessonController.getLessonsByCourse);
router.get('/lessons/:id', lessonController.getLessonById);

// Admin routes
router.post('/courses/:courseId/lessons', isAdmin, lessonController.createLesson);
router.put('/lessons/:id', isAdmin, lessonController.updateLesson);
router.delete('/lessons/:id', isAdmin, lessonController.deleteLesson);

export default router;