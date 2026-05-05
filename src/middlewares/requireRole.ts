import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../common/utils/httpError';

/**
 * Require the authenticated user to have `role === "user"` (end-user, not admin).
 * In the current schema any role value that is NOT 'admin' is treated as a regular user.
 * Must be placed AFTER `authenticateJwt`.
 */
export function requireUser(req: Request, _res: Response, next: NextFunction) {
  if (!req.authUser) {
    return next(HttpError.unauthorized('Authentication required'));
  }
  return next();
}

/**
 * Require the authenticated user to have `role === "admin"`.
 * Must be placed AFTER `authenticateJwt`.
 */
export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.authUser) {
    return next(HttpError.unauthorized('Authentication required'));
  }
  if (req.authUser.role !== 'admin') {
    return next(HttpError.forbidden('Admin access required'));
  }
  return next();
}
