import { Request, Response, NextFunction } from 'express';
import { quoteService } from '../services/quote.service';
import { electricianRepository } from '../repositories/electrician.repository';
import { sendSuccess, sendError } from '../utils/response';

export class QuoteController {
  async submitQuote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const profile = await electricianRepository.findByUserId(req.user.userId);
      if (!profile) {
        sendError(res, 'Electrician profile not found', 404);
        return;
      }
      const quote = await quoteService.submitQuote(profile.id, req.params.bookingId, req.body);
      sendSuccess(res, quote, 'Quote submitted successfully.', 201);
    } catch (err) {
      next(err);
    }
  }

  async acceptQuote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const updatedBooking = await quoteService.acceptQuote(
        req.user.userId,
        req.params.bookingId,
        req.params.quoteId
      );
      sendSuccess(res, updatedBooking, 'Quote accepted. Electrician assigned.');
    } catch (err) {
      next(err);
    }
  }
}

export const quoteController = new QuoteController();
