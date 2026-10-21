import { Router } from 'express';
import { bookingController } from '../controllers/booking.controller';
import { authenticate, optionalAuth, requireRole } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createDirectBookingSchema,
  createOpenRequestSchema,
  updateBookingStatusSchema,
  cancelBookingSchema,
  rescheduleBookingSchema,
} from '../validations/booking.validation';

const router = Router();

// Customer creates direct booking
router.post(
  '/direct',
  optionalAuth,
  validateRequest(createDirectBookingSchema),
  (req, res, next) => {
    bookingController.createDirectBooking(req, res, next);
  }
);

// Customer creates open request
router.post(
  '/open-request',
  optionalAuth,
  validateRequest(createOpenRequestSchema),
  (req, res, next) => {
    bookingController.createOpenRequest(req, res, next);
  }
);

// View user's own bookings
router.get('/my', authenticate, (req, res, next) => {
  bookingController.getMyBookings(req, res, next);
});

// View open requests (Electricians can browse and quote)
router.get('/open-requests', authenticate, (req, res, next) => {
  bookingController.getOpenRequests(req, res, next);
});

// Single booking details (with privacy mask applied)
router.get('/:id', optionalAuth, (req, res, next) => {
  bookingController.getBookingById(req, res, next);
});

// Status progression: ACCEPTED, ON_THE_WAY, IN_PROGRESS, COMPLETED
router.patch(
  '/:id/status',
  authenticate,
  validateRequest(updateBookingStatusSchema),
  (req, res, next) => {
    bookingController.updateStatus(req, res, next);
  }
);

// Cancellation
router.post(
  '/:id/cancel',
  authenticate,
  validateRequest(cancelBookingSchema),
  (req, res, next) => {
    bookingController.cancelBooking(req, res, next);
  }
);

// Reschedule
router.post(
  '/:id/reschedule',
  authenticate,
  validateRequest(rescheduleBookingSchema),
  (req, res, next) => {
    bookingController.rescheduleBooking(req, res, next);
  }
);

export default router;
