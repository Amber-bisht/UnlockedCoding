import { Request, Response, NextFunction } from 'express';

// Middleware to check if the user is authenticated
export const isAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized: Please log in' });
  }
};

// Middleware to check if the user is an admin
export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.isAuthenticated && req.isAuthenticated() && req.user?.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
};

// Middleware to check if user has completed profile
export const hasCompletedProfile = (req: Request, res: Response, next: NextFunction): void => {
  if (req.isAuthenticated && req.isAuthenticated() && req.user?.hasCompletedProfile) {
    next();
  } else {
    res.status(403).json({ 
      message: 'Profile completion required',
      redirect: '/profile-completion'
    });
  }
};