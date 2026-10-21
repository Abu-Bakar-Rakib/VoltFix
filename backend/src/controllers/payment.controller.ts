import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service';
import { electricianRepository } from '../repositories/electrician.repository';
import { sendSuccess, sendError } from '../utils/response';

export class PaymentController {
  async processPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const payment = await paymentService.processPayment(req.user.userId, req.body);
      sendSuccess(res, payment, 'Payment processed successfully.', 201);
    } catch (err) {
      next(err);
    }
  }

  async getEarnings(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      const earnings = await paymentService.getEarnings(profile.id);
      sendSuccess(res, earnings);
    } catch (err) {
      next(err);
    }
  }
}

export const paymentController = new PaymentController();
