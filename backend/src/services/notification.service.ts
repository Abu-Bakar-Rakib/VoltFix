import { notificationRepository } from '../repositories/notification.repository';

export class NotificationService {
  async getUserNotifications(userId: string, unreadOnly = false) {
    return notificationRepository.getUserNotifications(userId, unreadOnly);
  }

  async markAsRead(id: string, userId: string) {
    return notificationRepository.markAsRead(id, userId);
  }

  async markAllAsRead(userId: string) {
    return notificationRepository.markAllAsRead(userId);
  }

  async sendSystemNotification(userId: string, title: string, message: string) {
    return notificationRepository.create({
      userId,
      title,
      message,
      type: 'SYSTEM',
    });
  }
}

export const notificationService = new NotificationService();
