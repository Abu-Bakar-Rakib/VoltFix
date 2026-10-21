import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Process payment (Customer)
router.post('/', authenticate, requireRole(['CUSTOMER']), (req, res, next) => {
  paymentController.processPayment(req, res, next);
});

// View earnings (Electrician)
router.get('/earnings', authenticate, requireRole(['ELECTRICIAN']), (req, res, next) => {
  paymentController.getEarnings(req, res, next);
});

export default router;
