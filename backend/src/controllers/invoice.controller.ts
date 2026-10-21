import { Request, Response, NextFunction } from 'express';
import { invoiceService } from '../services/invoice.service';
import { electricianRepository } from '../repositories/electrician.repository';
import { sendSuccess, sendError } from '../utils/response';

export class InvoiceController {
  async createInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      const invoice = await invoiceService.createInvoice(
        profile.id,
        req.params.bookingId,
        req.body
      );
      sendSuccess(res, invoice, 'Invoice generated and submitted to customer.', 201);
    } catch (err) {
      next(err);
    }
  }

  async getInvoiceByBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invoice = await invoiceService.getInvoiceByBookingId(req.params.bookingId);
      sendSuccess(res, invoice);
    } catch (err) {
      next(err);
    }
  }

  async approveInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const approved = await invoiceService.approveInvoice(req.params.id, req.user.userId);
      sendSuccess(res, approved, 'Invoice approved.');
    } catch (err) {
      next(err);
    }
  }
}

export const invoiceController = new InvoiceController();
