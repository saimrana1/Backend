import type { NextFunction, Request, Response } from 'express';
import type { AnyZodObject, ZodTypeAny } from 'zod';
import { HttpError } from '../common/utils/httpError';

type Schema = AnyZodObject | ZodTypeAny;

export function validateBody<T extends Schema>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return next(parsed.error);
    (req as Request & { validatedBody: unknown }).validatedBody = parsed.data;
    return next();
  };
}

export function validateQuery<T extends Schema>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) return next(parsed.error);
    (req as Request & { validatedQuery: unknown }).validatedQuery = parsed.data;
    return next();
  };
}

export function getValidatedBody<T>(req: Request): T {
  const b = (req as Request & { validatedBody?: T }).validatedBody;
  if (b === undefined) throw HttpError.badRequest('Validated body missing (middleware misconfigured)');
  return b;
}

export function getValidatedQuery<T>(req: Request): T {
  const q = (req as Request & { validatedQuery?: T }).validatedQuery;
  if (q === undefined) throw HttpError.badRequest('Validated query missing (middleware misconfigured)');
  return q;
}
