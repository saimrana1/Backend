import { z } from 'zod';

export const searchQuerySchema = z.object({
  q: z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? undefined : v),
    z.string().min(1).max(200),
  ),
  category: z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? undefined : v),
    z.string().max(100).optional(),
  ),
  limit: z.preprocess((v) => (v ? Number(v) : 10), z.number().int().min(1).max(50).default(10)),
});
