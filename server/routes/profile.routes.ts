import express from 'express';
import { profileController } from '../controllers';
import { isAuthenticated } from '../middleware/auth.middleware';

const router = express.Router();

// Get user profile
router.get('/', isAuthenticated, profileController.getProfile);

// Create or update profile
router.post('/', isAuthenticated, profileController.createOrUpdateProfile);

export default router;