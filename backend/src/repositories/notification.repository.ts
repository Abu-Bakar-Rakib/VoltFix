import { prisma, getIsDbConnected } from '../config/db';
import { mockStore } from './mockStore';

export class NotificationRepository {
  async getUserNotifications(userId: string, unreadOnly = false) {
    if (getIsDbConnected()) {
      return prisma.notification.findMany({
        where: {
          userId,
          isRead: unreadOnly ? false : undefined,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    }

    return mockStore.notifications
      .filter((n) => n.userId === userId && (!unreadOnly || !n.isRead))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async create(data: {
    userId: string;
    title: string;
    message: string;
    type?: string;
    entityId?: string;
    entityType?: string;
  }) {
    if (getIsDbConnected()) {
      return prisma.notification.create({
        data: {
          ...data,
          type: data.type || 'SYSTEM',
        },
      });
    }

    const notif = {
      id: `notif-${Date.now()}`,
      ...data,
      type: data.type || 'SYSTEM',
      isRead: false,
      createdAt: new Date(),
    };
    mockStore.notifications.unshift(notif);
    return notif;
  }

  async markAsRead(id: string, userId: string) {
    if (getIsDbConnected()) {
      return prisma.notification.updateMany({
        where: { id, userId },
        data: { isRead: true, readAt: new Date() },
      });
    }

    const n = mockStore.notifications.find((item) => item.id === id && item.userId === userId);
    if (n) {
      n.isRead = true;
      n.readAt = new Date();
    }
    return n;
  }

  async markAllAsRead(userId: string) {
    if (getIsDbConnected()) {
      return prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true, readAt: new Date() },
      });
    }

    mockStore.notifications.forEach((n) => {
      if (n.userId === userId && !n.isRead) {
        n.isRead = true;
        n.readAt = new Date();
      }
    });
    return { count: 1 };
  }
}

export const notificationRepository = new NotificationRepository();
