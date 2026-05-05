import { z } from 'zod';

const avatarSchema = z
  .object({
    skin: z.string().max(20).optional(),
    hair: z.string().max(20).optional(),
    shirt: z.string().max(20).optional(),
    accent: z.string().max(20).optional(),
    pattern: z.enum(['dots', 'ring', 'stripes']).optional(),
  })
  .optional();

export const submitFeedbackSchema = z.object({
  name: z.string().min(1).max(120).trim(),
  role: z.string().max(120).trim().optional(),
  quote: z.string().min(1).max(2000).trim(),
  rating: z.number().int().min(1).max(5),
  avatar: avatarSchema,
});

export const listFeedbackQuerySchema = z.object({
  page: z.preprocess((v) => (v ? Number(v) : 1), z.number().int().min(1).default(1)),
  limit: z.preprocess((v) => (v ? Number(v) : 20), z.number().int().min(1).max(100).default(20)),
});
