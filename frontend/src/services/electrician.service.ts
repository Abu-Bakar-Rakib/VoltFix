import { api } from './api';
import { ApiResponse, ElectricianProfile, Category, Service } from '../types';

export const electricianService = {
  async search(params: any): Promise<{ electricians: ElectricianProfile[]; total: number }> {
    const res = await api.get<ApiResponse<ElectricianProfile[]>>('/search', { params });
    return {
      electricians: res.data.data,
      total: res.data.meta?.total || res.data.data.length,
    };
  },

  async getCategories(): Promise<Category[]> {
    const res = await api.get<ApiResponse<Category[]>>('/electricians/categories');
    return res.data.data;
  },

  async getProfile(id: string): Promise<ElectricianProfile> {
    const res = await api.get<ApiResponse<ElectricianProfile>>(`/electricians/${id}`);
    return res.data.data;
  },

  async getMyProfile(): Promise<ElectricianProfile> {
    const res = await api.get<ApiResponse<ElectricianProfile>>('/electricians/me/profile');
    return res.data.data;
  },

  async updateProfile(data: Partial<ElectricianProfile>): Promise<ElectricianProfile> {
    const res = await api.patch<ApiResponse<ElectricianProfile>>('/electricians/me/profile', data);
    return res.data.data;
  },

  async toggleOnline(isOnline: boolean): Promise<ElectricianProfile> {
    const res = await api.post<ApiResponse<ElectricianProfile>>('/electricians/me/toggle-online', { isOnline });
    return res.data.data;
  },

  async addService(data: Partial<Service>): Promise<Service> {
    const res = await api.post<ApiResponse<Service>>('/electricians/me/services', data);
    return res.data.data;
  },

  async updateService(id: string, data: Partial<Service>): Promise<Service> {
    const res = await api.patch<ApiResponse<Service>>(`/electricians/me/services/${id}`, data);
    return res.data.data;
  },

  async deleteService(id: string): Promise<void> {
    await api.delete(`/electricians/me/services/${id}`);
  },

  async setAvailability(slots: any[]): Promise<any> {
    const res = await api.post('/electricians/me/availability', { slots });
    return res.data.data;
  },

  async addTimeOff(data: { startDate: string; endDate: string; reason?: string }): Promise<any> {
    const res = await api.post('/electricians/me/time-off', data);
    return res.data.data;
  },

  async uploadDocument(formData: FormData): Promise<any> {
    const res = await api.post('/electricians/me/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },
};
