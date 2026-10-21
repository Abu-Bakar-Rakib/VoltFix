import { Router } from 'express';
import { reviewController } from '../controllers/review.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createReviewSchema,
  replyReviewSchema,
  reportReviewSchema,
} from '../validations/review.validation';

const router = Router();

// Customer submits review after COMPLETED job
router.post(
  '/',
  authenticate,
  requireRole(['CUSTOMER']),
  validateRequest(createReviewSchema),
  (req, res, next) => {
    reviewController.createReview(req, res, next);
  }
);

// Get reviews for an electrician
router.get('/electrician/:electricianId', (req, res, next) => {
  reviewController.getElectricianReviews(req, res, next);
});

// Electrician replies to review
router.post(
  '/:id/reply',
  authenticate,
  requireRole(['ELECTRICIAN']),
  validateRequest(replyReviewSchema),
  (req, res, next) => {
    reviewController.replyToReview(req, res, next);
  }
);

// Report abuse on a review
router.post(
  '/:id/report',
  authenticate,
  validateRequest(reportReviewSchema),
  (req, res, next) => {
    reviewController.reportReview(req, res, next);
  }
);

export default router;
