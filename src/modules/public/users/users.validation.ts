import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    username: z.string().min(1).max(120).trim().optional(),
    email: z.string().email().max(255).trim().optional().nullable(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'At least one field is required' });

export const withdrawSchema = z.object({
  method: z.enum(['bank', 'wallet', 'voucher']),
  amount: z.number().positive().max(1_000_000),
});

export const cashbackQuerySchema = z.object({
  page: z.preprocess((v) => (v ? Number(v) : 1), z.number().int().min(1).default(1)),
  limit: z.preprocess((v) => (v ? Number(v) : 20), z.number().int().min(1).max(100).default(20)),
  status: z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? undefined : v),
    z.enum(['pending', 'confirmed', 'withdrawn']).optional(),
  ),
});
