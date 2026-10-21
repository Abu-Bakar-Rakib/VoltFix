import { quoteRepository } from '../repositories/quote.repository';
import { bookingRepository } from '../repositories/booking.repository';
import { notificationRepository } from '../repositories/notification.repository';

export class QuoteService {
  async submitQuote(
    electricianProfileId: string,
    bookingId: string,
    data: {
      estimatedPrice: number;
      laborCost?: number;
      partsCost?: number;
      estimatedDurationMin?: number;
      note?: string;
    }
  ) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      const error: any = new Error('Booking request not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    if (booking.type !== 'OPEN_REQUEST') {
      const error: any = new Error('Quotes can only be submitted for Open Requests.');
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    const quote = await quoteRepository.createQuote({
      bookingId,
      electricianId: electricianProfileId,
      ...data,
    });

    // Notify customer
    await notificationRepository.create({
      userId: booking.customerId,
      title: 'New Quote Received',
      message: `An electrician has submitted a quote of $${data.estimatedPrice.toFixed(2)} for your request #${booking.bookingNumber}.`,
      type: 'BOOKING',
      entityId: booking.id,
      entityType: 'QUOTE',
    });

    return quote;
  }

  async acceptQuote(customerId: string, bookingId: string, quoteId: string) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      const error: any = new Error('Booking request not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    if (booking.customerId !== customerId) {
      const error: any = new Error('Only the request owner can accept a quote.');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    const quote = await quoteRepository.findById(quoteId);
    if (!quote) {
      const error: any = new Error('Quote not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    const updatedBooking = await quoteRepository.acceptQuote(
      quoteId,
      bookingId,
      quote.electricianId
    );

    // Notify electrician
    if (quote.electrician?.userId) {
      await notificationRepository.create({
        userId: quote.electrician.userId,
        title: 'Quote Accepted!',
        message: `Your quote for request #${booking.bookingNumber} was accepted! You are now assigned to the job.`,
        type: 'BOOKING',
        entityId: bookingId,
        entityType: 'BOOKING',
      });
    }

    return updatedBooking;
  }
}

export const quoteService = new QuoteService();
