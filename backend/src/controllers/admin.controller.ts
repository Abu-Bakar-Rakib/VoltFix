import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service';
import { sendSuccess, sendError } from '../utils/response';
import { processUploadedFile } from '../middlewares/upload.middleware';

export class AdminController {
  async getAnalytics(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await adminService.getDashboardAnalytics();
      sendSuccess(res, stats);
    } catch (err) {
      next(err);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role, search, page, limit } = req.query;
      const result = await adminService.getAllUsers({
        role: role as string,
        search: search as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });
      sendSuccess(res, result.users, undefined, 200, {
        total: result.total,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });
    } catch (err) {
      next(err);
    }
  }

  async toggleUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const { isActive } = req.body;
      const updated = await adminService.toggleUserStatus(
        req.params.id,
        Boolean(isActive),
        req.user.userId
      );
      sendSuccess(res, updated, `User ${isActive ? 'activated' : 'suspended'}.`);
    } catch (err) {
      next(err);
    }
  }

  async getVerificationQueue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as string;
      const queue = await adminService.getVerificationQueue(status);
      sendSuccess(res, queue);
    } catch (err) {
      next(err);
    }
  }

  async reviewVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const { status, rejectionReason } = req.body;
      const updated = await adminService.reviewVerification(
        req.params.profileId,
        status,
        req.user.userId,
        rejectionReason
      );
      sendSuccess(res, updated, `Electrician verification status updated to ${status}.`);
    } catch (err) {
      next(err);
    }
  }

  async getDisputes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as string;
      const disputes = await adminService.getDisputes(status);
      sendSuccess(res, disputes);
    } catch (err) {
      next(err);
    }
  }

  async resolveDispute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const { resolution, status } = req.body;
      const dispute = await adminService.resolveDispute(
        req.params.id,
        req.user.userId,
        resolution,
        status
      );
      sendSuccess(res, dispute, `Dispute marked as ${status}.`);
    } catch (err) {
      next(err);
    }
  }

  async raiseDispute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const { bookingId, reason, evidencePhotos } = req.body;
      const dispute = await adminService.raiseDispute(
        bookingId,
        req.user.userId,
        reason,
        evidencePhotos
      );
      sendSuccess(res, dispute, 'Dispute raised. Admin team will review.', 201);
    } catch (err) {
      next(err);
    }
  }

  async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const result = await adminService.getAuditLogs(page, limit);
      sendSuccess(res, result.logs, undefined, 200, {
        total: result.total,
        page,
        limit,
      });
    } catch (err) {
      next(err);
    }
  }

  async updateAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      let avatarUrl = req.body?.avatarUrl;
      if (req.file) {
        avatarUrl = await processUploadedFile(req.file);
      }
      if (!avatarUrl) {
        sendError(res, 'Avatar image file or URL is required', 400);
        return;
      }
      const updatedUser = await adminService.updateUserAvatar(req.user.userId, avatarUrl);
      sendSuccess(res, updatedUser, 'Profile picture updated successfully.');
    } catch (err) {
      next(err);
    }
  }
}

export const adminController = new AdminController();
