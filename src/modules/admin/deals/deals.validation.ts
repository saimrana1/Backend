import { z } from 'zod';

export const createDealSchema = z.object({
  title: z.string().min(1).max(300),
  shortDescriptionHtml: z.string().max(200000).optional(),
  longDescriptionHtml: z.string().max(200000).optional(),
  metaTitle: z.string().max(300).optional().nullable(),
  metaDescription: z.string().max(5000).optional().nullable(),
});

export const updateDealSchema = z
  .object({
    title: z.string().min(1).max(300).optional(),
    shortDescriptionHtml: z.string().max(200000).optional(),
    longDescriptionHtml: z.string().max(200000).optional(),
    metaTitle: z.string().max(300).optional().nullable(),
    metaDescription: z.string().max(5000).optional().nullable(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'At least one field is required' });
