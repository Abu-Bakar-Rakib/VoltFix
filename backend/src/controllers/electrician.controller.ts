import { Request, Response, NextFunction } from 'express';
import { electricianService } from '../services/electrician.service';
import { sendSuccess, sendError } from '../utils/response';
import { processUploadedFile } from '../middlewares/upload.middleware';

export class ElectricianController {
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await electricianService.getProfile(req.params.id);
      sendSuccess(res, profile);
    } catch (err) {
      next(err);
    }
  }

  async getMyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const profile = await electricianService.getProfileByUserId(req.user.userId);
      sendSuccess(res, profile);
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const profile = await electricianService.getProfileByUserId(req.user.userId);
      const updated = await electricianService.updateProfile(profile.id, req.body);
      sendSuccess(res, updated, 'Profile updated successfully.');
    } catch (err) {
      next(err);
    }
  }

  async toggleOnline(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const { isOnline } = req.body;
      const profile = await electricianService.getProfileByUserId(req.user.userId);
      const updated = await electricianService.toggleOnlineStatus(profile.id, Boolean(isOnline));
      sendSuccess(res, updated, `Status updated to ${isOnline ? 'Online' : 'Offline'}.`);
    } catch (err) {
      next(err);
    }
  }

  async addService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const profile = await electricianService.getProfileByUserId(req.user.userId);
      const service = await electricianService.addService(profile.id, req.body);
      sendSuccess(res, service, 'Service added successfully.', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await electricianService.updateService(req.params.id, req.body);
      sendSuccess(res, updated, 'Service updated successfully.');
    } catch (err) {
      next(err);
    }
  }

  async deleteService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await electricianService.deleteService(req.params.id);
      sendSuccess(res, null, 'Service removed.');
    } catch (err) {
      next(err);
    }
  }

  async setAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const profile = await electricianService.getProfileByUserId(req.user.userId);
      const slots = await electricianService.setAvailability(profile.id, req.body.slots);
      sendSuccess(res, slots, 'Weekly availability updated.');
    } catch (err) {
      next(err);
    }
  }

  async addTimeOff(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const profile = await electricianService.getProfileByUserId(req.user.userId);
      const timeOff = await electricianService.addTimeOff(profile.id, req.body);
      sendSuccess(res, timeOff, 'Time-off period recorded.', 201);
    } catch (err) {
      next(err);
    }
  }

  async uploadDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const profile = await electricianService.getProfileByUserId(req.user.userId);

      let documentUrl = req.body.documentUrl;
      if (req.file) {
        documentUrl = await processUploadedFile(req.file);
      }

      if (!documentUrl) {
        sendError(res, 'Document file or URL is required', 400);
        return;
      }

      const doc = await electricianService.uploadDocument(profile.id, {
        documentType: req.body.documentType,
        documentNumber: req.body.documentNumber,
        documentUrl,
      });

      sendSuccess(res, doc, 'Document uploaded for admin verification.', 201);
    } catch (err) {
      next(err);
    }
  }

  async getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await electricianService.getCategories();
      sendSuccess(res, categories);
    } catch (err) {
      next(err);
    }
  }
}

export const electricianController = new ElectricianController();
