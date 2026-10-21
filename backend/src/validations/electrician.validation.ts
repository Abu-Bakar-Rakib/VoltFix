import { z } from 'zod';

export const updateElectricianProfileSchema = z.object({
  body: z.object({
    bio: z.string().max(1000).optional(),
    experienceYears: z.number().int().min(0).max(60).optional(),
    skills: z.array(z.string()).optional(),
    serviceRadiusKm: z.number().positive().max(100).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    addressText: z.string().optional(),
    city: z.string().optional(),
    hourlyRate: z.number().positive().optional(),
    emergencyAvailable: z.boolean().optional(),
    isOnline: z.boolean().optional(),
    portfolioPhotos: z.array(z.string().url()).optional(),
  }),
});

export const createServiceSchema = z.object({
  body: z.object({
    categoryId: z.string().min(1, 'Valid Category ID is required'),
    title: z.string().min(3).max(120),
    description: z.string().max(800).optional(),
    pricingType: z.enum(['FIXED', 'HOURLY', 'INSPECTION']),
    basePrice: z.number().positive(),
    estimatedDurationMin: z.number().int().positive().default(60),
  }),
});

export const updateServiceSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    title: z.string().min(3).max(120).optional(),
    description: z.string().max(800).optional(),
    pricingType: z.enum(['FIXED', 'HOURLY', 'INSPECTION']).optional(),
    basePrice: z.number().positive().optional(),
    estimatedDurationMin: z.number().int().positive().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const setAvailabilitySchema = z.object({
  body: z.object({
    slots: z.array(
      z.object({
        dayOfWeek: z.number().int().min(0).max(6),
        startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format must be HH:MM'),
        endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format must be HH:MM'),
        isActive: z.boolean().default(true),
      })
    ),
  }),
});

export const addTimeOffSchema = z.object({
  body: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    reason: z.string().max(250).optional(),
  }),
});

export const uploadDocumentSchema = z.object({
  body: z.object({
    documentType: z.enum(['GOVERNMENT_ID', 'TRADE_LICENSE', 'INSURANCE_CERTIFICATE', 'OTHER']),
    documentUrl: z.string().url(),
    documentNumber: z.string().optional(),
  }),
});
