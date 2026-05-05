import { z } from 'zod';

export const cashbackListQuerySchema = z.object({
  status: z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? undefined : v),
    z.enum(['pending', 'confirmed', 'withdrawn']).optional(),
  ),
  page: z.preprocess((v) => (v ? Number(v) : 1), z.number().int().min(1).default(1)),
  limit: z.preprocess((v) => (v ? Number(v) : 20), z.number().int().min(1).max(100).default(20)),
});

export const cashbackFeaturedSchema = z.object({
  featured: z.boolean(),
});
