import { prisma, getIsDbConnected } from '../config/db';
import { mockStore } from './mockStore';

export class ChatRepository {
  async getMessages(bookingId: string) {
    if (getIsDbConnected()) {
      return prisma.message.findMany({
        where: { bookingId },
        include: { sender: true },
        orderBy: { createdAt: 'asc' },
      });
    }

    return mockStore.messages
      .filter((m) => m.bookingId === bookingId)
      .map((m) => ({
        ...m,
        sender: mockStore.users.find((u) => u.id === m.senderId),
      }))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createMessage(data: {
    bookingId: string;
    senderId: string;
    content: string;
    attachmentUrl?: string;
    attachmentType?: string;
  }) {
    if (getIsDbConnected()) {
      return prisma.message.create({
        data,
        include: { sender: true },
      });
    }

    const sender = mockStore.users.find((u) => u.id === data.senderId);
    const msg = {
      id: `msg-${Date.now()}`,
      ...data,
      isRead: false,
      readAt: null,
      createdAt: new Date(),
      sender,
    };
    mockStore.messages.push(msg);
    return msg;
  }

  async markAsRead(bookingId: string, currentUserId: string) {
    if (getIsDbConnected()) {
      return prisma.message.updateMany({
        where: {
          bookingId,
          senderId: { not: currentUserId },
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
    }

    mockStore.messages.forEach((m) => {
      if (m.bookingId === bookingId && m.senderId !== currentUserId && !m.isRead) {
        m.isRead = true;
        m.readAt = new Date();
      }
    });
    return { count: 1 };
  }
}

export const chatRepository = new ChatRepository();
