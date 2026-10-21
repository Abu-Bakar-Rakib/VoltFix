import { chatRepository } from '../repositories/chat.repository';
import { bookingRepository } from '../repositories/booking.repository';
import { notificationRepository } from '../repositories/notification.repository';

export class ChatService {
  async getMessages(bookingId: string, userId: string, userRole: string) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      const error: any = new Error('Booking not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    // Security check
    const isCustomer = booking.customerId === userId;
    const isElectrician =
      booking.electrician &&
      (booking.electrician.userId === userId || booking.electricianId === userId);
    const isAdmin = userRole === 'ADMIN';

    if (!isCustomer && !isElectrician && !isAdmin) {
      const error: any = new Error('Forbidden: You are not a participant in this booking chat.');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    return chatRepository.getMessages(bookingId);
  }

  async sendMessage(
    bookingId: string,
    senderId: string,
    content: string,
    attachmentUrl?: string,
    attachmentType?: string
  ) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      const error: any = new Error('Booking not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    const message = await chatRepository.createMessage({
      bookingId,
      senderId,
      content,
      attachmentUrl,
      attachmentType,
    });

    // Notify counterpart
    const isCustomer = booking.customerId === senderId;
    const recipientUserId = isCustomer ? booking.electrician?.userId : booking.customerId;

    if (recipientUserId) {
      await notificationRepository.create({
        userId: recipientUserId,
        title: 'New Chat Message',
        message: `${content.substring(0, 60)}${content.length > 60 ? '...' : ''}`,
        type: 'CHAT',
        entityId: bookingId,
        entityType: 'BOOKING',
      });
    }

    return message;
  }

  async markAsRead(bookingId: string, userId: string) {
    return chatRepository.markAsRead(bookingId, userId);
  }
}

export const chatService = new ChatService();
