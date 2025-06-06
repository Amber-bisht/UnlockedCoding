import { Request, Response } from 'express';
import { User } from '../models';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { logger } from '../utils/logger';

const scryptAsync = promisify(scrypt);

// Helper functions for password handling
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Register a new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, email } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(400).json({ message: 'Username already exists' });
      return;
    }
    
    // Prevent registering with the admin username
    if (username === 'admin123') {
      res.status(400).json({ message: 'Username not available' });
      return;
    }

    // Create new user with hashed password (always set isAdmin to false)
    const user = new User({
      username,
      password: await hashPassword(password),
      email,
      isAdmin: false, // Never allow setting admin through registration
      hasCompletedProfile: false
    });

    await user.save();

    // Format user response
    const userObj = user.toObject();
    delete userObj.password;
    
    const cleanUser = {
      id: userObj._id.toString(),
      username: userObj.username,
      email: userObj.email,
      isAdmin: userObj.isAdmin,
      hasCompletedProfile: userObj.hasCompletedProfile,
      createdAt: userObj.createdAt,
      updatedAt: userObj.updatedAt
    };

    // Create session
    if (req.login) {
      req.login(user, (err) => {
        if (err) {
          logger.error(`Login error after registration: ${err.message}`);
          res.status(500).json({ message: 'Error logging in after registration' });
          return;
        }
        res.status(201).json(cleanUser);
      });
    } else {
      // Return user without password if req.login is not available
      res.status(201).json(cleanUser);
    }
  } catch (error) {
    logger.error(`Registration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error registering user' });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Special handling for hardcoded admin
    const isAdminLogin = username === 'admin123' && password === 'passowrd@Admin123';
    
    // Find user
    const user = await User.findOne({ username }).populate('profile');
    if (!user) {
      // If it's admin login attempt but admin doesn't exist in DB yet, create it
      if (isAdminLogin) {
        const hashedPassword = await hashPassword(password);
        const newAdmin = new User({
          username,
          password: hashedPassword,
          email: 'admin@unlockedcoding.com',
          isAdmin: true,
          hasCompletedProfile: true
        });
        
        await newAdmin.save();
        logger.info('Admin user created during login attempt');
        
        // Format the newly created admin user for login
        const adminObj = newAdmin.toObject();
        delete adminObj.password;
        
        const cleanAdmin = {
          id: adminObj._id.toString(),
          username: adminObj.username,
          email: adminObj.email,
          isAdmin: adminObj.isAdmin,
          hasCompletedProfile: adminObj.hasCompletedProfile,
          createdAt: adminObj.createdAt
        };
        
        // Login the admin
        if (req.login) {
          req.login(newAdmin, (err) => {
            if (err) {
              logger.error(`Admin login error: ${err.message}`);
              res.status(500).json({ message: 'Error logging in admin' });
              return;
            }
            res.status(200).json(cleanAdmin);
          });
        } else {
          res.status(200).json(cleanAdmin);
        }
        return;
      }
      
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Verify password
    const isMatch = await comparePasswords(password, user.password);
    if (!isMatch) {
      // Special handling for admin login - if admin exists but password doesn't match the hardcoded one
      if (username === 'admin123' && password === 'passowrd@Admin123') {
        // Update admin password to match the hardcoded one
        user.password = await hashPassword(password);
        user.isAdmin = true; // Ensure admin flag is set
        await user.save();
        logger.info('Admin password updated to match hardcoded credentials');
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }
    }
    
    // If user is admin123, ensure isAdmin flag is set
    if (username === 'admin123' && !user.isAdmin) {
      user.isAdmin = true;
      await user.save();
      logger.info('Set isAdmin flag for admin123 user');
    }

    // Format user response
    const userObj = user.toObject();
    delete userObj.password;
    
    const cleanUser = {
      id: userObj._id.toString(),
      username: userObj.username,
      email: userObj.email,
      isAdmin: userObj.isAdmin,
      hasCompletedProfile: userObj.hasCompletedProfile,
      createdAt: userObj.createdAt,
      updatedAt: userObj.updatedAt,
      profile: userObj.profile
    };

    // Create session
    if (req.login) {
      req.login(user, (err) => {
        if (err) {
          logger.error(`Login error: ${err.message}`);
          res.status(500).json({ message: 'Error logging in' });
          return;
        }
        res.status(200).json(cleanUser);
      });
    } else {
      // Return formatted user if req.login is not available
      res.status(200).json(cleanUser);
    }
  } catch (error) {
    logger.error(`Login error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error logging in' });
  }
};

// Logout user
export const logout = (req: Request, res: Response): void => {
  if (req.logout) {
    req.logout((err) => {
      if (err) {
        logger.error(`Logout error: ${err.message}`);
        res.status(500).json({ message: 'Error logging out' });
        return;
      }
      res.status(200).json({ message: 'Logged out successfully' });
    });
  } else {
    // Handle case where req.logout is not available
    res.status(200).json({ message: 'Logged out successfully' });
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    // If user is already in req.user, use it
    if (req.user) {
      // Check if req.user is a mongoose document
      if (typeof req.user.toObject === 'function') {
        const userObj = req.user.toObject();
        delete userObj.password;
        
        // Clean up mongoose internals
        const cleanUser = {
          id: userObj._id.toString(),
          username: userObj.username,
          email: userObj.email,
          isAdmin: userObj.isAdmin,
          hasCompletedProfile: userObj.hasCompletedProfile,
          createdAt: userObj.createdAt,
          updatedAt: userObj.updatedAt,
          profile: userObj.profile
        };
        
        res.status(200).json(cleanUser);
      } else {
        // If not a mongoose document, assume it's already formatted
        const userResponse = { ...req.user };
        delete userResponse.password;
        res.status(200).json(userResponse);
      }
      return;
    }

    // Otherwise, fetch from database
    const user = await User.findById(req.session?.passport?.user).populate('profile');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Return user without password
    const userObj = user.toObject();
    delete userObj.password;
    
    // Clean up mongoose internals
    const cleanUser = {
      id: userObj._id.toString(),
      username: userObj.username,
      email: userObj.email,
      isAdmin: userObj.isAdmin,
      hasCompletedProfile: userObj.hasCompletedProfile,
      createdAt: userObj.createdAt,
      updatedAt: userObj.updatedAt,
      profile: userObj.profile
    };
    
    res.status(200).json(cleanUser);
  } catch (error) {
    logger.error(`Get current user error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error getting current user' });
  }
};