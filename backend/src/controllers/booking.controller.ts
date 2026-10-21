import { Request, Response, NextFunction } from 'express';
import { bookingService } from '../services/booking.service';
import { electricianRepository } from '../repositories/electrician.repository';
import { userRepository } from '../repositories/user.repository';
import { sendSuccess, sendError } from '../utils/response';

export class BookingController {
  async createDirectBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let customerId: string = req.user?.userId || '';
      if (!customerId) {
        const defaultCustomer = await userRepository.findByEmail('customer@voltfix.com');
        customerId = defaultCustomer?.id || 'usr-cust-01';
      }
      const booking = await bookingService.createDirectBooking(customerId, req.body);
      sendSuccess(res, booking, 'Booking request created successfully.', 201);
    } catch (err) {
      next(err);
    }
  }

  async createOpenRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let customerId: string = req.user?.userId || '';
      if (!customerId) {
        const defaultCustomer = await userRepository.findByEmail('customer@voltfix.com');
        customerId = defaultCustomer?.id || 'usr-cust-01';
      }
      const booking = await bookingService.createOpenRequest(customerId, req.body);
      sendSuccess(res, booking, 'Open electrical request published.', 201);
    } catch (err) {
      next(err);
    }
  }

  async getBookingById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const viewerUserId = req.user?.userId;
      const viewerRole = req.user?.role;
      const booking = await bookingService.getBookingById(req.params.id, viewerUserId, viewerRole);
      sendSuccess(res, booking);
    } catch (err) {
      next(err);
    }
  }

  async getMyBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      if (req.user.role === 'CUSTOMER') {
        const bookings = await bookingService.getCustomerBookings(req.user.userId);
        sendSuccess(res, bookings);
        return;
      }

      if (req.user.role === 'ELECTRICIAN') {
        const profile = await electricianRepository.findByUserId(req.user.userId);
        if (!profile) {
          sendError(res, 'Electrician profile not found', 404);
          return;
        }
        const bookings = await bookingService.getElectricianBookings(profile.id);
        sendSuccess(res, bookings);
        return;
      }

      sendError(res, 'Invalid role for booking history', 400);
    } catch (err) {
      next(err);
    }
  }

  async getOpenRequests(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requests = await bookingService.getOpenRequests();
      sendSuccess(res, requests);
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const { status, reason } = req.body;
      const updated = await bookingService.updateStatus(
        req.params.id,
        status,
        req.user.userId,
        req.user.role,
        reason
      );
      sendSuccess(res, updated, `Booking status updated to ${status}.`);
    } catch (err) {
      next(err);
    }
  }

  async cancelBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const { reason } = req.body;
      const cancelled = await bookingService.cancelBooking(
        req.params.id,
        req.user.userId,
        req.user.role,
        reason
      );
      sendSuccess(res, cancelled, 'Booking cancelled.');
    } catch (err) {
      next(err);
    }
  }

  async rescheduleBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const { scheduledAt, reason } = req.body;
      const rescheduled = await bookingService.rescheduleBooking(
        req.params.id,
        scheduledAt,
        req.user.userId,
        reason
      );
      sendSuccess(res, rescheduled, 'Booking rescheduled successfully.');
    } catch (err) {
      next(err);
    }
  }
}

export const bookingController = new BookingController();
