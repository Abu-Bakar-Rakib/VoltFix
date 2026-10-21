import { z } from 'zod';

export const createInvoiceSchema = z.object({
  params: z.object({
    bookingId: z.string().min(1),
  }),
  body: z.object({
    laborCost: z.number().nonnegative(),
    partsCost: z.number().nonnegative().default(0),
    tax: z.number().nonnegative().default(0),
    platformFee: z.number().nonnegative().default(0),
    items: z
      .array(
        z.object({
          description: z.string().min(2),
          cost: z.number().nonnegative(),
        })
      )
      .optional(),
    notes: z.string().max(1000).optional(),
  }),
});

export const approveInvoiceSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});
