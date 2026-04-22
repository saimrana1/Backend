import { z } from 'zod';

const QUALITIES = [50, 60, 70, 80, 90] as const;

export const compressImageBodySchema = z.object({
  quality: z.coerce
    .number()
    .int()
    .refine((q): q is (typeof QUALITIES)[number] => (QUALITIES as readonly number[]).includes(q), {
      message: `quality must be one of: ${QUALITIES.join(', ')}`,
    }),
});
