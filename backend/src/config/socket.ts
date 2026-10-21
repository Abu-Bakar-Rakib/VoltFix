import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyAccessToken } from '../utils/jwt';
import { logger } from './logger';

export let io: SocketIOServer;

export function setupSocketIO(httpServer: HttpServer, clientUrl: string): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: clientUrl,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Socket authentication middleware
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (token) {
      try {
        const payload = verifyAccessToken(token);
        (socket as any).user = payload;
      } catch (err) {
        logger.debug('Socket connection unauthenticated, proceeding as guest');
      }
    }
    next();
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    if (user?.userId) {
      // Join personal user room for direct live notifications
      socket.join(`user:${user.userId}`);
      logger.info({ userId: user.userId, socketId: socket.id }, 'User joined socket notification room');
    }

    // Join specific booking chat room
    socket.on('join_booking', (bookingId: string) => {
      socket.join(`booking:${bookingId}`);
      logger.info({ socketId: socket.id, bookingId }, 'Client joined booking room');
    });

    // Leave booking chat room
    socket.on('leave_booking', (bookingId: string) => {
      socket.leave(`booking:${bookingId}`);
    });

    // Handle real-time chat message broadcast
    socket.on('send_message', (data: { bookingId: string; message: any }) => {
      io.to(`booking:${data.bookingId}`).emit('new_message', data.message);
    });

    // Real-time typing indicators
    socket.on('typing_start', (data: { bookingId: string; userName: string }) => {
      socket.to(`booking:${data.bookingId}`).emit('user_typing', data);
    });

    socket.on('typing_stop', (data: { bookingId: string }) => {
      socket.to(`booking:${data.bookingId}`).emit('user_stopped_typing', data);
    });

    // Real-time read receipt broadcast
    socket.on('mark_read', (data: { bookingId: string; userId: string }) => {
      socket.to(`booking:${data.bookingId}`).emit('messages_read', data);
    });

    socket.on('disconnect', () => {
      logger.debug({ socketId: socket.id }, 'Socket disconnected');
    });
  });

  return io;
}

export function emitToUser(userId: string, event: string, data: any) {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

export function emitToBooking(bookingId: string, event: string, data: any) {
  if (io) {
    io.to(`booking:${bookingId}`).emit(event, data);
  }
}
