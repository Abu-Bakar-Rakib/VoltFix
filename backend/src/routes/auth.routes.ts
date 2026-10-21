import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { authLimiter } from '../middlewares/rateLimiter.middleware';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../validations/auth.validation';

const router = Router();

router.post('/register', authLimiter, validateRequest(registerSchema), (req, res, next) => {
  authController.register(req, res, next);
});

router.post('/login', authLimiter, validateRequest(loginSchema), (req, res, next) => {
  authController.login(req, res, next);
});

router.post('/logout', (req, res) => {
  authController.logout(req, res);
});

router.post('/refresh', (req, res, next) => {
  authController.refreshToken(req, res, next);
});

router.get('/me', authenticate, (req, res, next) => {
  authController.getMe(req, res, next);
});

router.post('/forgot-password', authLimiter, validateRequest(forgotPasswordSchema), (req, res, next) => {
  authController.forgotPassword(req, res, next);
});

router.post('/reset-password', authLimiter, validateRequest(resetPasswordSchema), (req, res, next) => {
  authController.resetPassword(req, res, next);
});

router.get('/verify-email', validateRequest(verifyEmailSchema), (req, res, next) => {
  authController.verifyEmail(req, res, next);
});

export default router;
