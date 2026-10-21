import { z } from 'zod';

export const searchElectriciansSchema = z.object({
  query: z.object({
    lat: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
    lng: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
    radius: z.string().optional().default('25').transform((v) => parseFloat(v)),
    categoryId: z.string().optional(),
    minRating: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
    minPrice: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
    maxPrice: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
    emergencyOnly: z.string().optional().transform((v) => v === 'true'),
    availableNow: z.string().optional().transform((v) => v === 'true'),
    query: z.string().optional(),
    sort: z
      .enum(['distance_asc', 'rating_desc', 'price_asc', 'price_desc', 'experience_desc'])
      .optional()
      .default('distance_asc'),
    page: z.string().optional().default('1').transform((v) => parseInt(v, 10)),
    limit: z.string().optional().default('12').transform((v) => parseInt(v, 10)),
  }),
});
