import { invoiceRepository } from '../repositories/invoice.repository';
import { bookingRepository } from '../repositories/booking.repository';
import { notificationRepository } from '../repositories/notification.repository';

export class InvoiceService {
  async createInvoice(
    electricianProfileId: string,
    bookingId: string,
    data: {
      laborCost: number;
      partsCost?: number;
      tax?: number;
      platformFee?: number;
      items?: any[];
      notes?: string;
    }
  ) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      const error: any = new Error('Booking not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    if (booking.electricianId !== electricianProfileId) {
      const error: any = new Error('Only the assigned electrician can generate an invoice.');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    const existing = await invoiceRepository.findByBookingId(bookingId);
    if (existing) {
      const error: any = new Error('An invoice already exists for this booking.');
      error.statusCode = 409;
      error.isOperational = true;
      throw error;
    }

    const laborCost = Number(data.laborCost) || 0;
    const partsCost = Number(data.partsCost) || 0;
    const subtotal = laborCost + partsCost;
    const platformFee = Math.round(subtotal * 0.05 * 100) / 100; // 5% platform fee
    const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% standard tax
    const totalAmount = subtotal + platformFee + tax;

    const invoice = await invoiceRepository.create({
      bookingId,
      electricianId: electricianProfileId,
      customerId: booking.customerId,
      laborCost,
      partsCost,
      tax,
      platformFee,
      totalAmount,
      items: data.items || [],
      notes: data.notes,
    });

    // Notify customer
    await notificationRepository.create({
      userId: booking.customerId,
      title: 'Invoice Issued',
      message: `An invoice of $${totalAmount.toFixed(2)} has been issued for booking #${booking.bookingNumber}. Please review and approve.`,
      type: 'INVOICE',
      entityId: invoice.id,
      entityType: 'INVOICE',
    });

    return invoice;
  }

  async getInvoiceByBookingId(bookingId: string) {
    return invoiceRepository.findByBookingId(bookingId);
  }

  async approveInvoice(invoiceId: string, customerId: string) {
    const invoice = await invoiceRepository.findById(invoiceId);
    if (!invoice) {
      const error: any = new Error('Invoice not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    if (invoice.customerId !== customerId) {
      const error: any = new Error('Only the customer can approve this invoice.');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    return invoiceRepository.approveInvoice(invoiceId);
  }
}

export const invoiceService = new InvoiceService();
