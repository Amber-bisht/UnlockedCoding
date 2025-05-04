import { Request, Response } from 'express';
import { Profile, User } from '../models';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

// Create or update user profile
export const createOrUpdateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const userId = req.user?._id || req.session?.passport?.user;
    if (!userId) {
      res.status(401).json({ message: 'User ID not found' });
      return;
    }

    const { fullName, bio, interest, profileImageUrl } = req.body;

    // Check if profile already exists
    let profile = await Profile.findOne({ userId });

    if (profile) {
      // Update existing profile
      profile.fullName = fullName || profile.fullName;
      profile.bio = bio || profile.bio;
      profile.interest = interest || profile.interest;
      profile.profileImageUrl = profileImageUrl || profile.profileImageUrl;
    } else {
      // Create new profile
      profile = new Profile({
        userId,
        fullName,
        bio,
        interest,
        profileImageUrl
      });
    }

    await profile.save();

    // Update user to mark profile as completed
    await User.findByIdAndUpdate(userId, { hasCompletedProfile: true });

    // Get updated user with profile
    const user = await User.findById(userId).populate('profile');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    res.status(200).json(userResponse);
  } catch (error) {
    logger.error(`Profile creation/update error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error creating/updating profile' });
  }
};

// Get user profile
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const userId = req.user?._id || req.session?.passport?.user;
    if (!userId) {
      res.status(401).json({ message: 'User ID not found' });
      return;
    }

    // Find profile
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    res.status(200).json(profile);
  } catch (error) {
    logger.error(`Get profile error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error getting profile' });
  }
};