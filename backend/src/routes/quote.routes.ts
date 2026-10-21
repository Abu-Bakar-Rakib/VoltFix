import { Router } from 'express';
import { quoteController } from '../controllers/quote.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { submitQuoteSchema, acceptQuoteSchema } from '../validations/booking.validation';

const router = Router();

// Electrician submits quote for open booking request
router.post(
  '/:bookingId',
  authenticate,
  requireRole(['ELECTRICIAN']),
  validateRequest(submitQuoteSchema),
  (req, res, next) => {
    quoteController.submitQuote(req, res, next);
  }
);

// Customer accepts quote
router.post(
  '/:bookingId/accept/:quoteId',
  authenticate,
  requireRole(['CUSTOMER']),
  validateRequest(acceptQuoteSchema),
  (req, res, next) => {
    quoteController.acceptQuote(req, res, next);
  }
);

export default router;
