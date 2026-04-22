import { z } from 'zod';

export const mediaUploadMetaSchema = z.object({
  entityType: z.enum(['store', 'category', 'deal', 'coupon']),
  entityId: z.coerce.number().int().positive().optional(),
});
