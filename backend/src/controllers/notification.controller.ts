import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service';
import { sendSuccess, sendError } from '../utils/response';

export class NotificationController {
  async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const unreadOnly = req.query.unread === 'true';
      const notifications = await notificationService.getUserNotifications(
        req.user.userId,
        unreadOnly
      );
      sendSuccess(res, notifications);
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      await notificationService.markAsRead(req.params.id, req.user.userId);
      sendSuccess(res, null, 'Notification marked as read.');
    } catch (err) {
      next(err);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      await notificationService.markAllAsRead(req.user.userId);
      sendSuccess(res, null, 'All notifications marked as read.');
    } catch (err) {
      next(err);
    }
  }
}

export const notificationController = new NotificationController();
