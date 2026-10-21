import { Router } from 'express';
import { invoiceController } from '../controllers/invoice.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { createInvoiceSchema, approveInvoiceSchema } from '../validations/invoice.validation';

const router = Router();

// Electrician issues invoice
router.post(
  '/:bookingId',
  authenticate,
  requireRole(['ELECTRICIAN']),
  validateRequest(createInvoiceSchema),
  (req, res, next) => {
    invoiceController.createInvoice(req, res, next);
  }
);

// View invoice for booking
router.get('/:bookingId', authenticate, (req, res, next) => {
  invoiceController.getInvoiceByBooking(req, res, next);
});

// Customer approves invoice
router.patch(
  '/:id/approve',
  authenticate,
  requireRole(['CUSTOMER']),
  validateRequest(approveInvoiceSchema),
  (req, res, next) => {
    invoiceController.approveInvoice(req, res, next);
  }
);

export default router;
