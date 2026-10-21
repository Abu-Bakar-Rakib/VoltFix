import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { sendError } from '../utils/response';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'Authentication required. Missing Bearer token.', 401, 'UNAUTHORIZED');
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      sendError(res, 'Access token has expired. Please refresh token.', 401, 'TOKEN_EXPIRED');
      return;
    }
    sendError(res, 'Invalid or corrupted access token.', 401, 'INVALID_TOKEN');
  }
};

export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = verifyAccessToken(token);
    } catch {
      // Ignored for optional auth
    }
  }
  next();
};

export const requireRole = (allowedRoles: ('CUSTOMER' | 'ELECTRICIAN' | 'ADMIN')[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required.', 401, 'UNAUTHORIZED');
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(
        res,
        `Forbidden: Insufficient privileges. Required role(s): ${allowedRoles.join(', ')}`,
        403,
        'FORBIDDEN'
      );
      return;
    }

    next();
  };
};

/**
 * Privacy helper to mask address and phone number for bookings
 * until booking is accepted, unless the viewer is Admin or the customer/electrician of the booking.
 */
export function applyBookingPrivacyMask(booking: any, viewerUserId?: string, viewerRole?: string): any {
  if (!booking) return booking;

  const isAcceptedOrBeyond = [
    'ACCEPTED',
    'ON_THE_WAY',
    'IN_PROGRESS',
    'COMPLETED',
  ].includes(booking.status);

  const isAdmin = viewerRole === 'ADMIN';
  const isDirectCustomer = viewerUserId === booking.customerId;
  const isDirectElectrician =
    booking.electrician &&
    (viewerUserId === booking.electrician.userId ||
      viewerUserId === booking.electricianId);

  // If accepted or viewer is admin/owner, keep complete data
  if (isAcceptedOrBeyond || isAdmin || isDirectCustomer || isDirectElectrician) {
    return booking;
  }

  // Otherwise mask exact street and phone
  return {
    ...booking,
    addressStreet: '*** Masked until booking is accepted ***',
    customerPhone: booking.customerPhone
      ? booking.customerPhone.replace(/\d(?=\d{4})/g, '*')
      : undefined,
    electricianPhone: booking.electricianPhone
      ? booking.electricianPhone.replace(/\d(?=\d{4})/g, '*')
      : undefined,
  };
}
