import { z } from 'zod';
import { objectIdZod } from '../../../common/validation/params';

export const listCouponsQuerySchema = z.object({
  storeId: z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? undefined : v),
    objectIdZod.optional(),
  ),
});

export const createCouponSchema = z.object({
  storeId: objectIdZod,
  title: z.string().min(1).max(300),
  offerDetails: z.string().min(1).max(5000),
  couponCode: z.string().max(120).optional().nullable(),
  destinationUrl: z.string().url().max(2000).optional().nullable(),
  descriptionHtml: z.string().max(200000).optional().nullable(),
  active: z.boolean().optional(),
  featured: z.boolean().optional(),
});

export const updateCouponSchema = z
  .object({
    storeId: objectIdZod.optional(),
    title: z.string().min(1).max(300).optional(),
    offerDetails: z.string().min(1).max(5000).optional(),
    couponCode: z.string().max(120).optional().nullable(),
    destinationUrl: z.string().url().max(2000).optional().nullable(),
    descriptionHtml: z.string().max(200000).optional().nullable(),
    active: z.boolean().optional(),
    featured: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'At least one field is required' });

export const reorderCouponsBodySchema = z.object({
  orderedIds: z.array(objectIdZod).min(1),
});
