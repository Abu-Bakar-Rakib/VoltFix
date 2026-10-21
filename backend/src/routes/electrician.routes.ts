import { Router } from 'express';
import { electricianController } from '../controllers/electrician.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { upload } from '../middlewares/upload.middleware';
import {
  updateElectricianProfileSchema,
  createServiceSchema,
  updateServiceSchema,
  setAvailabilitySchema,
  addTimeOffSchema,
} from '../validations/electrician.validation';

const router = Router();

// Public
router.get('/categories', (req, res, next) => {
  electricianController.getCategories(req, res, next);
});

router.get('/:id', (req, res, next) => {
  electricianController.getProfile(req, res, next);
});

// Authenticated Electrician Only
router.get('/me/profile', authenticate, requireRole(['ELECTRICIAN']), (req, res, next) => {
  electricianController.getMyProfile(req, res, next);
});

router.patch(
  '/me/profile',
  authenticate,
  requireRole(['ELECTRICIAN']),
  validateRequest(updateElectricianProfileSchema),
  (req, res, next) => {
    electricianController.updateProfile(req, res, next);
  }
);

router.post(
  '/me/toggle-online',
  authenticate,
  requireRole(['ELECTRICIAN']),
  (req, res, next) => {
    electricianController.toggleOnline(req, res, next);
  }
);

router.post(
  '/me/services',
  authenticate,
  requireRole(['ELECTRICIAN']),
  validateRequest(createServiceSchema),
  (req, res, next) => {
    electricianController.addService(req, res, next);
  }
);

router.patch(
  '/me/services/:id',
  authenticate,
  requireRole(['ELECTRICIAN']),
  validateRequest(updateServiceSchema),
  (req, res, next) => {
    electricianController.updateService(req, res, next);
  }
);

router.delete(
  '/me/services/:id',
  authenticate,
  requireRole(['ELECTRICIAN']),
  (req, res, next) => {
    electricianController.deleteService(req, res, next);
  }
);

router.post(
  '/me/availability',
  authenticate,
  requireRole(['ELECTRICIAN']),
  validateRequest(setAvailabilitySchema),
  (req, res, next) => {
    electricianController.setAvailability(req, res, next);
  }
);

router.post(
  '/me/time-off',
  authenticate,
  requireRole(['ELECTRICIAN']),
  validateRequest(addTimeOffSchema),
  (req, res, next) => {
    electricianController.addTimeOff(req, res, next);
  }
);

router.post(
  '/me/documents',
  authenticate,
  requireRole(['ELECTRICIAN']),
  upload.single('document'),
  (req, res, next) => {
    electricianController.uploadDocument(req, res, next);
  }
);

export default router;
