import { z } from 'zod';
import { objectIdZod } from '../../../common/validation/params';

export const mediaUploadMetaSchema = z.object({
  entityType: z.enum(['store', 'category', 'deal', 'coupon']),
  entityId: z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? undefined : v),
    objectIdZod.optional(),
  ),
});
