import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notificationService';
import { User } from '../config/models';

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const notifications = await NotificationService.getUserNotifications(userId);
    res.json(notifications);
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await NotificationService.markAsRead(id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const dismissNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await NotificationService.dismiss(id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { settings } = req.body;
    
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    
    user.notificationSettings = {
      ...user.notificationSettings,
      ...settings
    };
    
    await user.save();
    res.json({ success: true, settings: user.notificationSettings });
  } catch (err) {
    next(err);
  }
};
