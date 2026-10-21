import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    bookingId: z.string().min(1, 'Valid Booking ID is required'),
    rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
    comment: z.string().min(5, 'Review comment must be at least 5 characters').max(2000),
    photos: z.array(z.string().url()).optional(),
  }),
});

export const replyReviewSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    replyComment: z.string().min(2, 'Reply must be at least 2 characters').max(1000),
  }),
});

export const reportReviewSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    reason: z.string().min(5, 'Report reason must be at least 5 characters').max(500),
  }),
});
