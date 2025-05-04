import express from 'express';
import { categoryController } from '../controllers';
import { isAdmin } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:slug', categoryController.getCategoryBySlug);

// Admin routes
router.post('/', isAdmin, categoryController.createCategory);
router.put('/:id', isAdmin, categoryController.updateCategory);
router.delete('/:id', isAdmin, categoryController.deleteCategory);

export default router;