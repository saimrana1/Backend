import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { HttpError } from '../common/utils/httpError';

const HEADER = 'x-admin-api-key';

export function requireApiKeyWhenConfigured(req: Request, _res: Response, next: NextFunction) {
  if (!env.adminApiKey) return next();
  const provided = req.header(HEADER);
  if (!provided || provided !== env.adminApiKey) {
    return next(HttpError.unauthorized(`Missing or invalid ${HEADER} header`));
  }
  return next();
}
