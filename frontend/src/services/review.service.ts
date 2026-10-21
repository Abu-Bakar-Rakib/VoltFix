import { api } from './api';
import { ApiResponse, Review } from '../types';

export const reviewService = {
  async createReview(data: {
    bookingId: string;
    rating: number;
    comment: string;
    photos?: string[];
  }): Promise<Review> {
    const res = await api.post<ApiResponse<Review>>('/reviews', data);
    return res.data.data;
  },

  async getElectricianReviews(electricianId: string, page = 1): Promise<Review[]> {
    const res = await api.get<ApiResponse<Review[]>>(`/reviews/electrician/${electricianId}`, {
      params: { page },
    });
    return res.data.data;
  },

  async replyToReview(reviewId: string, replyComment: string): Promise<Review> {
    const res = await api.post<ApiResponse<Review>>(`/reviews/${reviewId}/reply`, { replyComment });
    return res.data.data;
  },

  async reportReview(reviewId: string, reason: string): Promise<any> {
    const res = await api.post<ApiResponse<any>>(`/reviews/${reviewId}/report`, { reason });
    return res.data.data;
  },
};
