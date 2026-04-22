import { z } from 'zod';
import { StoreStatus } from '../../../common/constants/enums';
import { objectIdZod } from '../../../common/validation/params';

const statusEnum = z.enum([StoreStatus.ACTIVE, StoreStatus.DRAFT, StoreStatus.DISABLED]);

export const createStoreSchema = z.object({
  name: z.string().min(1).max(200),
  heading: z.string().min(1).max(300),
  status: statusEnum.optional(),
  featured: z.boolean().optional(),
  affiliateUrl: z.string().url().max(2000).optional().nullable(),
  descriptionShortHtml: z.string().max(200000).optional(),
  descriptionLongHtml: z.string().max(200000).optional(),
  categoryIds: z.array(objectIdZod).optional(),
});

export const updateStoreSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    heading: z.string().min(1).max(300).optional(),
    status: statusEnum.optional(),
    featured: z.boolean().optional(),
    affiliateUrl: z.string().url().max(2000).optional().nullable(),
    descriptionShortHtml: z.string().max(200000).optional(),
    descriptionLongHtml: z.string().max(200000).optional(),
    categoryIds: z.array(objectIdZod).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'At least one field is required' });

export const storeFeaturedBodySchema = z.object({
  featured: z.boolean(),
});
