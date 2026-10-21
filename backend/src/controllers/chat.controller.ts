import { Request, Response, NextFunction } from 'express';
import { chatService } from '../services/chat.service';
import { sendSuccess, sendError } from '../utils/response';
import { processUploadedFile } from '../middlewares/upload.middleware';

export class ChatController {
  async getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const messages = await chatService.getMessages(
        req.params.bookingId,
        req.user.userId,
        req.user.role
      );
      sendSuccess(res, messages);
    } catch (err) {
      next(err);
    }
  }

  async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      let attachmentUrl = req.body.attachmentUrl;
      let attachmentType = req.body.attachmentType;

      if (req.file) {
        attachmentUrl = await processUploadedFile(req.file);
        attachmentType = req.file.mimetype.startsWith('image/') ? 'IMAGE' : 'FILE';
      }

      const message = await chatService.sendMessage(
        req.params.bookingId,
        req.user.userId,
        req.body.content,
        attachmentUrl,
        attachmentType
      );

      sendSuccess(res, message, 'Message sent.', 201);
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
      await chatService.markAsRead(req.params.bookingId, req.user.userId);
      sendSuccess(res, null, 'Messages marked as read.');
    } catch (err) {
      next(err);
    }
  }
}

export const chatController = new ChatController();
