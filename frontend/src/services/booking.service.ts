import { api } from './api';
import { ApiResponse, Booking, Quote } from '../types';

export const bookingService = {
  async createDirectBooking(data: any): Promise<Booking> {
    const res = await api.post<ApiResponse<Booking>>('/bookings/direct', data);
    return res.data.data;
  },

  async createOpenRequest(data: any): Promise<Booking> {
    const res = await api.post<ApiResponse<Booking>>('/bookings/open-request', data);
    return res.data.data;
  },

  async getMyBookings(): Promise<Booking[]> {
    const res = await api.get<ApiResponse<Booking[]>>('/bookings/my');
    return res.data.data;
  },

  async getOpenRequests(): Promise<Booking[]> {
    const res = await api.get<ApiResponse<Booking[]>>('/bookings/open-requests');
    return res.data.data;
  },

  async getBookingById(id: string): Promise<Booking> {
    const res = await api.get<ApiResponse<Booking>>(`/bookings/${id}`);
    return res.data.data;
  },

  async updateStatus(id: string, status: string, reason?: string): Promise<Booking> {
    const res = await api.patch<ApiResponse<Booking>>(`/bookings/${id}/status`, { status, reason });
    return res.data.data;
  },

  async cancelBooking(id: string, reason: string): Promise<Booking> {
    const res = await api.post<ApiResponse<Booking>>(`/bookings/${id}/cancel`, { reason });
    return res.data.data;
  },

  async rescheduleBooking(id: string, scheduledAt: string, reason?: string): Promise<Booking> {
    const res = await api.post<ApiResponse<Booking>>(`/bookings/${id}/reschedule`, { scheduledAt, reason });
    return res.data.data;
  },

  async submitQuote(bookingId: string, data: any): Promise<Quote> {
    const res = await api.post<ApiResponse<Quote>>(`/quotes/${bookingId}`, data);
    return res.data.data;
  },

  async acceptQuote(bookingId: string, quoteId: string): Promise<Booking> {
    const res = await api.post<ApiResponse<Booking>>(`/quotes/${bookingId}/accept/${quoteId}`);
    return res.data.data;
  },
};
