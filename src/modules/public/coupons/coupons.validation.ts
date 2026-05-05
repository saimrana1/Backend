import { z } from 'zod';
import { objectIdZod } from '../../../common/validation/params';

export const listPublicCouponsQuerySchema = z.object({
  category: z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? undefined : v),
    z.string().max(100).optional(),
  ),
  storeId: z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? undefined : v),
    objectIdZod.optional(),
  ),
  search: z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? undefined : v),
    z.string().max(200).optional(),
  ),
  page: z.preprocess((v) => (v ? Number(v) : 1), z.number().int().min(1).default(1)),
  limit: z.preprocess((v) => (v ? Number(v) : 20), z.number().int().min(1).max(100).default(20)),
});

export const couponCommentBodySchema = z.object({
  text: z.string().min(1).max(2000).trim(),
});

export const listCommentsQuerySchema = z.object({
  page: z.preprocess((v) => (v ? Number(v) : 1), z.number().int().min(1).default(1)),
  limit: z.preprocess((v) => (v ? Number(v) : 20), z.number().int().min(1).max(100).default(20)),
});
