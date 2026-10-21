import { api } from './api';
import { ApiResponse, User } from '../types';

export const authService = {
  async register(data: any): Promise<{ user: User; accessToken: string }> {
    const res = await api.post<ApiResponse<{ user: User; accessToken: string }>>('/auth/register', data);
    return res.data.data;
  },

  async login(data: { email: string; password: string }): Promise<{ user: User; accessToken: string }> {
    const res = await api.post<ApiResponse<{ user: User; accessToken: string }>>('/auth/login', data);
    return res.data.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getMe(): Promise<User> {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', { token, newPassword });
  },

  async verifyEmail(token: string): Promise<void> {
    await api.get(`/auth/verify-email?token=${token}`);
  },
};
