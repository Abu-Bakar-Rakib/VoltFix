import { Router } from 'express';
import { chatController } from '../controllers/chat.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

router.get('/:bookingId', authenticate, (req, res, next) => {
  chatController.getMessages(req, res, next);
});

router.post('/:bookingId', authenticate, upload.single('attachment'), (req, res, next) => {
  chatController.sendMessage(req, res, next);
});

router.post('/:bookingId/read', authenticate, (req, res, next) => {
  chatController.markAsRead(req, res, next);
});

export default router;
