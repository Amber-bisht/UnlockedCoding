import mongoose from 'mongoose';
import { connectDB } from '../config/database';
import { Category, Course, User } from '../models';
import { logger } from '../utils/logger';

// Create one test course
async function quickSeed() {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info('Connected to MongoDB');
    
    // Get first category
    const category = await Category.findOne({ slug: 'web-development' });
    
    if (!category) {
      logger.error('No categories found. Please run the full seed script first.');
      process.exit(1);
    }
    
    // Get admin user
    const admin = await User.findOne({ username: 'admin' });
    
    if (!admin) {
      logger.error('Admin user not found. Please run the full seed script first.');
      process.exit(1);
    }
    
    // Create test course
    const course = new Course({
      title: 'JavaScript Advanced Concepts',
      slug: 'javascript-advanced-concepts',
      description: 'Master advanced JavaScript concepts like closures, prototypes, and async programming',
      imageUrl: 'https://images.unsplash.com/photo-1605142059316-9f369241cd9c?w=500&auto=format',
      price: 69.99,
      duration: 20,
      level: 'Advanced',
      categoryId: category._id,
      instructorId: admin._id,
      lessonCount: 0,
      rating: 0
    });
    
    await course.save();
    logger.info(`Course created: ${course.title}`);
    
    logger.info('Quick seed completed!');
    process.exit(0);
  } catch (error) {
    logger.error(`Seed error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

quickSeed();