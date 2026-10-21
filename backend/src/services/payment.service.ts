import crypto from 'crypto';
import { paymentRepository } from '../repositories/payment.repository';
import { invoiceRepository } from '../repositories/invoice.repository';
import { bookingRepository } from '../repositories/booking.repository';
import { notificationRepository } from '../repositories/notification.repository';
import { env } from '../config/env';

export class PaymentService {
  async processPayment(customerId: string, data: {
    bookingId: string;
    invoiceId?: string;
    amount: number;
    method: 'CASH' | 'ONLINE_SANDBOX' | 'CARD' | 'WALLET';
    idempotencyKey?: string;
  }) {
    if (!env.ENABLE_PAYMENTS) {
      const error: any = new Error('Payments feature is currently disabled by system configuration.');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    // 1. Idempotency check
    if (data.idempotencyKey) {
      const existing = await paymentRepository.findByIdempotencyKey(data.idempotencyKey);
      if (existing) {
        return {
          ...existing,
          isDuplicate: true,
          message: 'Idempotent response: payment previously processed.',
        };
      }
    }

    const booking = await bookingRepository.findById(data.bookingId);
    if (!booking) {
      const error: any = new Error('Booking not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    // Simulate online sandbox transaction
    const transactionId = `TXN-SANDBOX-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
    const receiptUrl = `/receipts/${data.bookingId}-${Date.now()}.pdf`;

    const payment = await paymentRepository.createPayment({
      bookingId: data.bookingId,
      invoiceId: data.invoiceId,
      customerId,
      amount: data.amount,
      currency: 'USD',
      method: data.method,
      status: 'COMPLETED',
      transactionId,
      idempotencyKey: data.idempotencyKey,
      receiptUrl,
    });

    // Notify electrician
    if (booking.electrician?.userId) {
      await notificationRepository.create({
        userId: booking.electrician.userId,
        title: 'Payment Received',
        message: `Payment of $${data.amount.toFixed(2)} received via ${data.method} for booking #${booking.bookingNumber}.`,
        type: 'PAYMENT',
        entityId: payment.id,
        entityType: 'PAYMENT',
      });
    }

    return payment;
  }

  async getEarnings(electricianId: string) {
    return paymentRepository.getElectricianEarnings(electricianId);
  }
}

export const paymentService = new PaymentService();
