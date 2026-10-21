import { api } from './api';
import { ApiResponse, Message, Notification } from '../types';

export const chatService = {
  async getMessages(bookingId: string): Promise<Message[]> {
    const res = await api.get<ApiResponse<Message[]>>(`/chat/${bookingId}`);
    return res.data.data;
  },

  async sendMessage(bookingId: string, formData: FormData): Promise<Message> {
    const res = await api.post<ApiResponse<Message>>(`/chat/${bookingId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  async markAsRead(bookingId: string): Promise<void> {
    await api.post(`/chat/${bookingId}/read`);
  },
};

export const notificationService = {
  async getNotifications(unreadOnly = false): Promise<Notification[]> {
    const res = await api.get<ApiResponse<Notification[]>>('/notifications', {
      params: { unread: unreadOnly },
    });
    return res.data.data;
  },

  async markAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  },
};
