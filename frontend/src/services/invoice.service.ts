import { api } from './api';
import { ApiResponse, Invoice, Payment } from '../types';

export const invoiceService = {
  async createInvoice(bookingId: string, data: any): Promise<Invoice> {
    const res = await api.post<ApiResponse<Invoice>>(`/invoices/${bookingId}`, data);
    return res.data.data;
  },

  async getInvoiceByBooking(bookingId: string): Promise<Invoice> {
    const res = await api.get<ApiResponse<Invoice>>(`/invoices/${bookingId}`);
    return res.data.data;
  },

  async approveInvoice(invoiceId: string): Promise<Invoice> {
    const res = await api.patch<ApiResponse<Invoice>>(`/invoices/${invoiceId}/approve`);
    return res.data.data;
  },

  async processPayment(data: {
    bookingId: string;
    invoiceId?: string;
    amount: number;
    method: string;
    idempotencyKey?: string;
  }): Promise<Payment> {
    const res = await api.post<ApiResponse<Payment>>('/payments', data);
    return res.data.data;
  },

  async getEarnings(): Promise<any> {
    const res = await api.get<ApiResponse<any>>('/payments/earnings');
    return res.data.data;
  },
};
