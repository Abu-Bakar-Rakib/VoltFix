import { Router } from 'express';
import { searchController } from '../controllers/search.controller';
import { searchLimiter } from '../middlewares/rateLimiter.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { searchElectriciansSchema } from '../validations/search.validation';

const router = Router();

router.get(
  '/',
  searchLimiter,
  validateRequest(searchElectriciansSchema),
  (req, res, next) => {
    searchController.search(req, res, next);
  }
);

export default router;
