import express from 'express';
import { authController } from '../controllers';
import passport from 'passport';

const router = express.Router();

// Register new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Logout user
router.post('/logout', authController.logout);

// Get current user
router.get('/user', authController.getCurrentUser);

export default router;