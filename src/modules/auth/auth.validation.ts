import { z } from 'zod';

export const loginBodySchema = z.object({
  username: z.string().min(1).max(120),
  password: z.string().min(1).max(256),
});

export const registerBodySchema = z.object({
  username: z.string().min(1).max(120).trim(),
  password: z.string().min(8).max(256),
});
