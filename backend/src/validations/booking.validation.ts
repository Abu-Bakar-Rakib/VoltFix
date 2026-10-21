import { z } from 'zod';

export const createDirectBookingSchema = z.object({
  body: z.object({
    electricianId: z.string().min(1, 'Valid Electrician ID is required'),
    serviceId: z.string().min(1).optional(),
    categoryId: z.string().min(1).optional(),
    problemDescription: z.string().min(10, 'Please describe the problem in detail (min 10 characters)'),
    scheduledAt: z.string().datetime('Valid scheduled date/time is required'),
    estimatedDurationMin: z.number().int().min(15).max(720).default(60),
    isEmergency: z.boolean().default(false),
    addressStreet: z.string().min(3, 'Street address is required'),
    addressCity: z.string().min(2, 'City is required'),
    addressZip: z.string().optional(),
    addressLat: z.number().min(-90).max(90),
    addressLng: z.number().min(-180).max(180),
    customerPhone: z.string().min(8, 'Contact phone is required'),
    photos: z.array(z.string().url()).optional(),
  }),
});

export const createOpenRequestSchema = z.object({
  body: z.object({
    categoryId: z.string().min(1).optional(),
    problemDescription: z.string().min(10, 'Please describe your electrical request in detail'),
    scheduledAt: z.string().datetime(),
    estimatedDurationMin: z.number().int().min(15).max(720).default(120),
    isEmergency: z.boolean().default(false),
    addressStreet: z.string().min(3),
    addressCity: z.string().min(2),
    addressZip: z.string().optional(),
    addressLat: z.number().min(-90).max(90),
    addressLng: z.number().min(-180).max(180),
    customerPhone: z.string().min(8),
    photos: z.array(z.string().url()).optional(),
  }),
});

export const updateBookingStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    status: z.enum(['ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
    reason: z.string().optional(),
  }),
});

export const cancelBookingSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    reason: z.string().min(5, 'Cancellation reason is required (min 5 chars)'),
  }),
});

export const rescheduleBookingSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    scheduledAt: z.string().datetime('Valid new date/time is required'),
    reason: z.string().optional(),
  }),
});

export const submitQuoteSchema = z.object({
  params: z.object({
    bookingId: z.string().min(1),
  }),
  body: z.object({
    estimatedPrice: z.number().positive('Estimated price must be positive'),
    laborCost: z.number().positive().optional(),
    partsCost: z.number().nonnegative().optional(),
    estimatedDurationMin: z.number().int().positive().default(60),
    note: z.string().max(1000).optional(),
  }),
});

export const acceptQuoteSchema = z.object({
  params: z.object({
    bookingId: z.string().min(1),
    quoteId: z.string().min(1),
  }),
});
