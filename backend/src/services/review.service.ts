import { reviewRepository } from '../repositories/review.repository';
import { bookingRepository } from '../repositories/booking.repository';

export class ReviewService {
  async createReview(customerId: string, data: {
    bookingId: string;
    rating: number;
    comment: string;
    photos?: string[];
  }) {
    // 1. Check if booking exists
    const booking = await bookingRepository.findById(data.bookingId);
    if (!booking) {
      const error: any = new Error('Booking not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    // 2. Security check: only the booking's customer can review
    if (booking.customerId !== customerId) {
      const error: any = new Error('Only the customer who made this booking can submit a review.');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    // 3. Status check: only COMPLETED bookings can be reviewed
    if (booking.status !== 'COMPLETED') {
      const error: any = new Error(
        `Reviews can only be submitted for completed jobs. Current status: ${booking.status}`
      );
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    // 4. Unique check: only 1 review per booking
    const existing = await reviewRepository.findByBookingId(data.bookingId);
    if (existing) {
      const error: any = new Error('A review has already been submitted for this booking.');
      error.statusCode = 409;
      error.isOperational = true;
      throw error;
    }

    if (!booking.electricianId) {
      throw new Error('No electrician assigned to this booking.');
    }

    return reviewRepository.createReview({
      bookingId: data.bookingId,
      customerId,
      electricianId: booking.electricianId,
      rating: data.rating,
      comment: data.comment,
      photos: data.photos,
    });
  }

  async getElectricianReviews(electricianId: string, page = 1, limit = 10) {
    return reviewRepository.findByElectricianId(electricianId, page, limit);
  }

  async replyToReview(electricianUserId: string, reviewId: string, replyComment: string) {
    const review = await reviewRepository.findByBookingId(reviewId);
    // Allow reply
    return reviewRepository.replyToReview(reviewId, replyComment);
  }

  async reportReview(reviewId: string, reporterUserId: string, reason: string) {
    return reviewRepository.reportReview(reviewId, reporterUserId, reason);
  }
}

export const reviewService = new ReviewService();
