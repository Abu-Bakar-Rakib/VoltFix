import { Request, Response, NextFunction } from 'express';
import { reviewService } from '../services/review.service';
import { sendSuccess, sendError } from '../utils/response';

export class ReviewController {
  async createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const review = await reviewService.createReview(req.user.userId, req.body);
      sendSuccess(res, review, 'Thank you! Your verified review has been published.', 201);
    } catch (err) {
      next(err);
    }
  }

  async getElectricianReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const result = await reviewService.getElectricianReviews(req.params.electricianId, page, limit);
      sendSuccess(res, result.reviews, undefined, 200, {
        total: result.total,
        page,
        limit,
      });
    } catch (err) {
      next(err);
    }
  }

  async replyToReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const updated = await reviewService.replyToReview(
        req.user.userId,
        req.params.id,
        req.body.replyComment
      );
      sendSuccess(res, updated, 'Reply added to review.');
    } catch (err) {
      next(err);
    }
  }

  async reportReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const report = await reviewService.reportReview(
        req.params.id,
        req.user.userId,
        req.body.reason
      );
      sendSuccess(res, report, 'Review report submitted for moderation.');
    } catch (err) {
      next(err);
    }
  }
}

export const reviewController = new ReviewController();
