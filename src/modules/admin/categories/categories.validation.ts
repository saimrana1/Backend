import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).optional().nullable(),
  description: z.string().max(50000).optional().nullable(),
  featureEnabled: z.boolean().optional(),
  slider: z.boolean().optional(),
});

export const updateCategorySchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    slug: z.string().min(1).max(200).optional(),
    description: z.string().max(50000).optional().nullable(),
    featureEnabled: z.boolean().optional(),
    slider: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'At least one field is required' });

export const categoryFeatureBodySchema = z.object({
  featureEnabled: z.boolean(),
});

export const categorySliderBodySchema = z.object({
  slider: z.boolean(),
});
