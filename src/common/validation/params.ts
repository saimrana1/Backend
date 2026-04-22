import mongoose from 'mongoose';
import { z } from 'zod';

/** MongoDB ObjectId as 24-char hex string (URL / JSON friendly). */
export const objectIdZod = z.string().refine((v) => mongoose.Types.ObjectId.isValid(v), { message: 'Invalid id' });

export const idParamSchema = objectIdZod;

/** Optional / null network or other ref. */
export const optionalObjectIdNullable = z.union([objectIdZod, z.null()]).optional();
