import express from 'express';
import { User, Course, Category, Enrollment } from '../models';
import { isAdmin } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';

const router = express.Router();

// Get total users count
router.get('/admin/users/count', async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.status(200).json(count);
  } catch (error) {
    logger.error(`Error getting users count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching users count' });
  }
});

// Get total courses count
router.get('/admin/courses/count', async (req, res) => {
  try {
    const count = await Course.countDocuments();
    res.status(200).json(count);
  } catch (error) {
    logger.error(`Error getting courses count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching courses count' });
  }
});

// Get total categories count
router.get('/admin/categories/count', async (req, res) => {
  try {
    const count = await Category.countDocuments();
    res.status(200).json(count);
  } catch (error) {
    logger.error(`Error getting categories count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching categories count' });
  }
});

// Get total enrollments count
router.get('/admin/enrollments/count', async (req, res) => {
  try {
    const count = await Enrollment.countDocuments();
    res.status(200).json(count);
  } catch (error) {
    logger.error(`Error getting enrollments count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching enrollments count' });
  }
});

// Get dashboard summary stats
router.get('/admin/dashboard/stats', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const courseCount = await Course.countDocuments();
    const categoryCount = await Category.countDocuments();
    const enrollmentCount = await Enrollment.countDocuments();
    
    res.status(200).json({
      users: userCount,
      courses: courseCount,
      categories: categoryCount,
      enrollments: enrollmentCount
    });
  } catch (error) {
    logger.error(`Error getting dashboard stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
});

export default router;