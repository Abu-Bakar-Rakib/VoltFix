import { Router } from 'express';
import authRoutes from './auth.routes';
import electricianRoutes from './electrician.routes';
import searchRoutes from './search.routes';
import bookingRoutes from './booking.routes';
import quoteRoutes from './quote.routes';
import invoiceRoutes from './invoice.routes';
import reviewRoutes from './review.routes';
import chatRoutes from './chat.routes';
import notificationRoutes from './notification.routes';
import paymentRoutes from './payment.routes';
import adminRoutes from './admin.routes';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/electricians', electricianRoutes);
apiRouter.use('/search', searchRoutes);
apiRouter.use('/bookings', bookingRoutes);
apiRouter.use('/quotes', quoteRoutes);
apiRouter.use('/invoices', invoiceRoutes);
apiRouter.use('/reviews', reviewRoutes);
apiRouter.use('/chat', chatRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/admin', adminRoutes);

// Health check endpoint
apiRouter.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'VoltFix Marketplace API',
    uptime: process.uptime(),
  });
});

export default apiRouter;
