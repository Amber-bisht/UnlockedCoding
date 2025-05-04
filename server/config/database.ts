import mongoose from 'mongoose';
import { logger } from '../utils/logger';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://bishtamber0:ispRUER29IIYsKpR@cluster0.f2mvi.mongodb.net/unlocked-coding';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`MongoDB connection error: ${error.message}`);
    } else {
      logger.error('MongoDB connection error: Unknown error');
    }
    // Exit process with failure
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected successfully');
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`MongoDB disconnection error: ${error.message}`);
    } else {
      logger.error('MongoDB disconnection error: Unknown error');
    }
  }
};

// Handle unexpected process termination
process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDB();
  process.exit(0);
});