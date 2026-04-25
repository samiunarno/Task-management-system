import { User, Task, Notification } from '../config/models';
import { Server } from 'socket.io';
import { EmailService } from './emailService';
import mongoose from 'mongoose';

export class NotificationService {
  private static io: Server;

  static init(io: Server) {
    this.io = io;
    console.log('[Notification System] Initialized');
    // Periodically check for upcoming task deadlines
    setInterval(() => this.checkPendingTasks(), 60000);
  }

  private static async checkPendingTasks() {
    // Prevent operations if DB is not connected
    if (mongoose.connection.readyState !== 1) {
      console.warn('[Notification System] DB disconnected. Skipping check.');
      return;
    }

    try {
      const now = new Date();
      // We look for users who have either in-app or email notifications enabled
      const users = await User.find({
        $or: [
          { 'notificationSettings.inApp': true },
          { 'notificationSettings.email': true }
        ]
      });

      for (const user of users) {
        const settings = user.notificationSettings || { inApp: true, email: true, reminderAdvanceMinutes: 30 };
        const advanceMs = (settings.reminderAdvanceMinutes || 30) * 60 * 1000;
        const threshold = new Date(now.getTime() + advanceMs);

        const tasks = await Task.find({
          userId: user._id,
          isDone: false,
          notified: false,
          dueDate: { $lte: threshold, $gt: now }
        });

        for (const task of tasks) {
          await this.dispatchNotification(user, task);
          task.notified = true;
          await task.save();
        }
      }
    } catch (error) {
      console.error('[Notification System Error]:', error);
    }
  }

  private static async dispatchNotification(user: any, task: any) {
    const message = `IMMEDIATE_TASK_ALERT: "${task.title}" reaches deadline threshold in < ${user.notificationSettings?.reminderAdvanceMinutes || 30} mins.`;

    // 1. In-App Logic
    if (user.notificationSettings?.inApp) {
      const notification = new Notification({
        userId: user._id,
        taskId: task._id,
        message,
        type: 'TaskReminder'
      });
      await notification.save();

      if (this.io) {
        this.io.to(`user_${user._id}`).emit('new_notification', notification);
      }
    }

    // 2. Email Logic (Using EmailService)
    if (user.notificationSettings?.email) {
      await EmailService.sendEmail(
        user.email,
        `Academic Alert: ${task.title}`,
        `Task "${task.title}" is approaching its deadline at ${task.dueDate.toLocaleString()}. Log in to StudyFlow to complete it.`
      );
    }
  }

  static async markAsRead(notificationId: string) {
    await Notification.findByIdAndUpdate(notificationId, { isRead: true });
  }

  static async dismiss(notificationId: string) {
    await Notification.findByIdAndDelete(notificationId);
  }

  static async getUserNotifications(userId: string) {
    return await Notification.find({ userId }).sort({ createdAt: -1 }).limit(20);
  }
}
