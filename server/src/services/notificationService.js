// src/services/notificationService.js
import Notification from '../models/Notification.js';
import { NOTIFICATION_TYPES } from '../constants/index.js';

export const notificationService = {
  createNotification: async ({ recipientId, type, title, message, data }) => {
    if (!Object.values(NOTIFICATION_TYPES).includes(type)) return;
    return Notification.create({ recipient: recipientId, type, title, message, data });
  },

  getUserNotifications: async (userId, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    const [notifications, total, unread] = await Promise.all([
      Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ recipient: userId }),
      Notification.countDocuments({ recipient: userId, isRead: false }),
    ]);
    return { notifications, total, unread };
  },

  markAsRead: async (notificationId, userId) => {
    return Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
  },

  markAllAsRead: async (userId) => {
    return Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  },

  deleteNotification: async (notificationId, userId) => {
    return Notification.findOneAndDelete({ _id: notificationId, recipient: userId });
  },
};
