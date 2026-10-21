import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { sendError } from '../utils/response';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error({
    err: {
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code,
    },
    url: req.originalUrl,
    method: req.method,
  }, 'Unhandled request error');

  // Prisma unique constraint violation (P2002)
  if (err.code === 'P2002') {
    const target = err.meta?.target || 'field';
    sendError(res, `A record with this ${target} already exists.`, 409, 'DUPLICATE_RESOURCE');
    return;
  }

  // Prisma record not found (P2025)
  if (err.code === 'P2025') {
    sendError(res, 'The requested resource was not found.', 404, 'NOT_FOUND');
    return;
  }

  // Default internal server error
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error occurred';
  sendError(res, message, statusCode, err.code || 'INTERNAL_SERVER_ERROR');
};
