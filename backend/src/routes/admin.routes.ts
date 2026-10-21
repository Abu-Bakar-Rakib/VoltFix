import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

// Protect all admin routes with ADMIN role requirement
router.use(authenticate, requireRole(['ADMIN']));

router.post('/avatar', upload.single('avatar'), (req, res, next) => {
  adminController.updateAvatar(req, res, next);
});

router.get('/analytics', (req, res, next) => {
  adminController.getAnalytics(req, res, next);
});

router.get('/users', (req, res, next) => {
  adminController.getUsers(req, res, next);
});

router.patch('/users/:id/status', (req, res, next) => {
  adminController.toggleUserStatus(req, res, next);
});

router.get('/verifications', (req, res, next) => {
  adminController.getVerificationQueue(req, res, next);
});

router.post('/verifications/:profileId', (req, res, next) => {
  adminController.reviewVerification(req, res, next);
});

router.get('/disputes', (req, res, next) => {
  adminController.getDisputes(req, res, next);
});

router.post('/disputes/:id/resolve', (req, res, next) => {
  adminController.resolveDispute(req, res, next);
});

router.get('/audit-logs', (req, res, next) => {
  adminController.getAuditLogs(req, res, next);
});

export default router;
