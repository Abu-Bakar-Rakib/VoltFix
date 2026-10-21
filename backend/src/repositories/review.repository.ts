import { prisma, getIsDbConnected } from '../config/db';
import { mockStore } from './mockStore';

export class ReviewRepository {
  async findByBookingId(bookingId: string) {
    if (getIsDbConnected()) {
      return prisma.review.findUnique({
        where: { bookingId },
        include: { customer: true, electrician: { include: { user: true } } },
      });
    }
    const r = mockStore.reviews.find((rev) => rev.bookingId === bookingId);
    if (!r) return null;
    const customer = mockStore.users.find((u) => u.id === r.customerId);
    const electrician = mockStore.electricianProfiles.find((p) => p.id === r.electricianId);
    return { ...r, customer, electrician };
  }

  async findByElectricianId(electricianId: string, page = 1, limit = 10) {
    if (getIsDbConnected()) {
      const [reviews, total] = await Promise.all([
        prisma.review.findMany({
          where: { electricianId },
          include: { customer: true },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.review.count({ where: { electricianId } }),
      ]);
      return { reviews, total };
    }

    const list = mockStore.reviews
      .filter((r) => r.electricianId === electricianId)
      .map((r) => ({
        ...r,
        customer: mockStore.users.find((u) => u.id === r.customerId),
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = list.length;
    const paginated = list.slice((page - 1) * limit, page * limit);
    return { reviews: paginated, total };
  }

  async createReview(data: {
    bookingId: string;
    customerId: string;
    electricianId: string;
    rating: number;
    comment: string;
    photos?: string[];
  }) {
    if (getIsDbConnected()) {
      return prisma.$transaction(async (tx) => {
        // 1. Create review
        const review = await tx.review.create({
          data: {
            bookingId: data.bookingId,
            customerId: data.customerId,
            electricianId: data.electricianId,
            rating: data.rating,
            comment: data.comment,
            photos: data.photos || [],
          },
        });

        // 2. Recompute electrician profile ratingAverage & reviewCount
        const stats = await tx.review.aggregate({
          where: { electricianId: data.electricianId },
          _avg: { rating: true },
          _count: { id: true },
        });

        await tx.electricianProfile.update({
          where: { id: data.electricianId },
          data: {
            ratingAverage: Math.round((stats._avg.rating || data.rating) * 10) / 10,
            reviewCount: stats._count.id,
          },
        });

        return review;
      });
    }

    const newReview = {
      id: `rev-${Date.now()}`,
      ...data,
      photos: data.photos || [],
      replyComment: null,
      repliedAt: null,
      isReported: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockStore.reviews.push(newReview);

    // Recompute
    const elecReviews = mockStore.reviews.filter((r) => r.electricianId === data.electricianId);
    const sum = elecReviews.reduce((acc, curr) => acc + curr.rating, 0);
    const avg = Math.round((sum / elecReviews.length) * 10) / 10;

    const pIdx = mockStore.electricianProfiles.findIndex((p) => p.id === data.electricianId);
    if (pIdx !== -1) {
      mockStore.electricianProfiles[pIdx].ratingAverage = avg;
      mockStore.electricianProfiles[pIdx].reviewCount = elecReviews.length;
    }

    return newReview;
  }

  async replyToReview(reviewId: string, replyComment: string) {
    if (getIsDbConnected()) {
      return prisma.review.update({
        where: { id: reviewId },
        data: {
          replyComment,
          repliedAt: new Date(),
        },
      });
    }

    const idx = mockStore.reviews.findIndex((r) => r.id === reviewId);
    if (idx === -1) return null;
    mockStore.reviews[idx].replyComment = replyComment;
    mockStore.reviews[idx].repliedAt = new Date();
    mockStore.reviews[idx].updatedAt = new Date();
    return mockStore.reviews[idx];
  }

  async reportReview(reviewId: string, reporterUserId: string, reason: string) {
    if (getIsDbConnected()) {
      return prisma.$transaction(async (tx) => {
        await tx.review.update({
          where: { id: reviewId },
          data: { isReported: true },
        });
        return tx.report.create({
          data: {
            reporterUserId,
            targetType: 'REVIEW',
            targetId: reviewId,
            reason,
            status: 'PENDING',
          },
        });
      });
    }

    const idx = mockStore.reviews.findIndex((r) => r.id === reviewId);
    if (idx !== -1) {
      mockStore.reviews[idx].isReported = true;
    }

    const report = {
      id: `rep-${Date.now()}`,
      reporterUserId,
      targetType: 'REVIEW',
      targetId: reviewId,
      reason,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockStore.reports.push(report);
    return report;
  }
}

export const reviewRepository = new ReviewRepository();
