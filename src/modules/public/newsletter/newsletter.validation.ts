import { z } from 'zod';

export const subscribeSchema = z.object({
  email: z.string().email().max(255).trim().toLowerCase(),
});

export const unsubscribeSchema = z.object({
  email: z.string().email().max(255).trim().toLowerCase(),
});
