import mongoose from 'mongoose';
import User from '../models/User';
import { hashPassword } from '../controllers/auth.controller';
import { connectDB, disconnectDB } from '../config/database';
import { logger } from '../utils/logger';

async function createAdminUser() {
  try {
    // Connect to the database
    await connectDB();
    logger.info('Connected to MongoDB');

    // Define admin credentials
    const adminUsername = 'admin123';
    const adminPassword = 'passowrd@Admin123';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: adminUsername });
    
    if (existingAdmin) {
      // If admin exists but is not marked as admin, update the isAdmin flag
      if (!existingAdmin.isAdmin) {
        existingAdmin.isAdmin = true;
        await existingAdmin.save();
        logger.info(`User ${adminUsername} updated to admin`);
      } else {
        logger.info(`Admin user ${adminUsername} already exists`);
      }
    } else {
      // Create the admin user
      const hashedPassword = await hashPassword(adminPassword);
      
      const admin = new User({
        username: adminUsername,
        password: hashedPassword,
        email: 'admin@unlockedcoding.com',
        isAdmin: true,
        hasCompletedProfile: true
      });
      
      await admin.save();
      logger.info(`Admin user ${adminUsername} created successfully`);
    }
    
    // Disconnect from the database
    await disconnectDB();
    logger.info('Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    logger.error(`Error creating admin user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

// Run the function
createAdminUser();