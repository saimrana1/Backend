import { z } from 'zod';

export const listPublicStoresQuerySchema = z.object({
  category: z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? undefined : v),
    z.string().max(100).optional(),
  ),
  featured: z.preprocess(
    (v) => {
      if (v === '' || v === undefined || v === null) return undefined;
      if (v === 'true' || v === '1') return true;
      if (v === 'false' || v === '0') return false;
      return undefined;
    },
    z.boolean().optional(),
  ),
  search: z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? undefined : v),
    z.string().max(200).optional(),
  ),
  page: z.preprocess((v) => (v ? Number(v) : 1), z.number().int().min(1).default(1)),
  limit: z.preprocess((v) => (v ? Number(v) : 20), z.number().int().min(1).max(100).default(20)),
});
