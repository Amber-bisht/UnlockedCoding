import { Request, Response } from 'express';
import { Notification, User } from '../models';
import { logger } from '../utils/logger';

export const getAllNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.find({
      $or: [
        { recipients: 'all' },
        { recipients: { $in: [req.user?.id] } }
      ],
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    logger.error(`Error fetching notifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

export const getUnreadNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const notifications = await Notification.find({
      $or: [
        { recipients: 'all' },
        { recipients: { $in: [userId] } }
      ],
      read: { $nin: [userId] },
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    logger.error(`Error fetching unread notifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching unread notifications' });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { notificationId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    // Add user to read array if not already there
    if (!notification.read.includes(userId)) {
      await Notification.findByIdAndUpdate(
        notificationId,
        { $addToSet: { read: userId } },
        { new: true }
      );
    }

    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    logger.error(`Error marking notification as read: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error marking notification as read' });
  }
};

export const markAllNotificationsAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const notifications = await Notification.find({
      $or: [
        { recipients: 'all' },
        { recipients: { $in: [userId] } }
      ],
      read: { $nin: [userId] },
      expiresAt: { $gt: new Date() }
    });

    // Update each notification to add the user to the read array
    const updatePromises = notifications.map(notification => 
      Notification.findByIdAndUpdate(
        notification._id,
        { $addToSet: { read: userId } },
        { new: true }
      )
    );

    await Promise.all(updatePromises);

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    logger.error(`Error marking all notifications as read: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error marking all notifications as read' });
  }
};

export const createNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, message, type, recipients, expiresAt } = req.body;
    
    if (!title || !message) {
      res.status(400).json({ message: 'Title and message are required' });
      return;
    }

    // Validate recipient users if specific users are targeted
    if (recipients !== 'all' && Array.isArray(recipients)) {
      const userCount = await User.countDocuments({ _id: { $in: recipients } });
      
      if (userCount !== recipients.length) {
        res.status(400).json({ message: 'One or more recipient users do not exist' });
        return;
      }
    }

    const notification = new Notification({
      title,
      message,
      type: type || 'info',
      recipients: recipients || 'all',
      expiresAt: expiresAt || undefined
    });

    await notification.save();

    res.status(201).json(notification);
  } catch (error) {
    logger.error(`Error creating notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error creating notification' });
  }
};

export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error deleting notification' });
  }
};