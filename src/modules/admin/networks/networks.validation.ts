import { z } from 'zod';
import { NetworkStatus } from '../../../common/constants/enums';

const statusEnum = z.enum([NetworkStatus.ACTIVE, NetworkStatus.INACTIVE]);

export const createNetworkSchema = z.object({
  name: z.string().min(1).max(200),
  trackingUrl: z.string().url().max(2000).optional().nullable(),
});

export const updateNetworkSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    trackingUrl: z.string().url().max(2000).optional().nullable(),
    status: statusEnum.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'At least one field is required' });

export const networkStatusBodySchema = z.object({
  status: statusEnum,
});
