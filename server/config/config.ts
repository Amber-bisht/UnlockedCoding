import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export default {
  // Node environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Server configuration
  PORT: process.env.PORT || 5000,
  
  // MongoDB connection
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://bishtamber0:ispRUER29IIYsKpR@cluster0.f2mvi.mongodb.net/unlocked-coding',
  
  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  
  // Session configuration
  SESSION_SECRET: process.env.SESSION_SECRET || 'unlocked-coding-secret-key',
  SESSION_EXPIRY: Number(process.env.SESSION_EXPIRY) || 60 * 60 * 24 * 7, // 1 week in seconds
};