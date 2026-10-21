import { api } from './api';
import { ApiResponse, User, ElectricianProfile } from '../types';

export const adminService = {
  async getAnalytics(): Promise<any> {
    const res = await api.get<ApiResponse<any>>('/admin/analytics');
    return res.data.data;
  },

  async getUsers(params: any): Promise<{ users: User[]; total: number }> {
    const res = await api.get<ApiResponse<User[]>>('/admin/users', { params });
    return {
      users: res.data.data,
      total: res.data.meta?.total || res.data.data.length,
    };
  },

  async toggleUserStatus(id: string, isActive: boolean): Promise<User> {
    const res = await api.patch<ApiResponse<User>>(`/admin/users/${id}/status`, { isActive });
    return res.data.data;
  },

  async getVerificationQueue(status?: string): Promise<ElectricianProfile[]> {
    const res = await api.get<ApiResponse<ElectricianProfile[]>>('/admin/verifications', {
      params: { status },
    });
    return res.data.data;
  },

  async reviewVerification(
    profileId: string,
    status: 'APPROVED' | 'REJECTED',
    rejectionReason?: string
  ): Promise<ElectricianProfile> {
    const res = await api.post<ApiResponse<ElectricianProfile>>(`/admin/verifications/${profileId}`, {
      status,
      rejectionReason,
    });
    return res.data.data;
  },

  async getDisputes(status?: string): Promise<any[]> {
    const res = await api.get<ApiResponse<any[]>>('/admin/disputes', { params: { status } });
    return res.data.data;
  },

  async resolveDispute(id: string, resolution: string, status: 'RESOLVED' | 'REJECTED'): Promise<any> {
    const res = await api.post<ApiResponse<any>>(`/admin/disputes/${id}/resolve`, {
      resolution,
      status,
    });
    return res.data.data;
  },

  async getAuditLogs(page = 1, limit = 50): Promise<{ logs: any[]; total: number }> {
    const res = await api.get<ApiResponse<any[]>>('/admin/audit-logs', { params: { page, limit } });
    return {
      logs: res.data.data,
      total: res.data.meta?.total || res.data.data.length,
    };
  },

  async updateAvatar(formDataOrUrl: FormData | { avatarUrl: string }): Promise<User> {
    const headers = formDataOrUrl instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const res = await api.post<ApiResponse<User>>('/admin/avatar', formDataOrUrl, { headers });
    return res.data.data;
  },
};
