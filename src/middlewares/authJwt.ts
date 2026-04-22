import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { HttpError } from '../common/utils/httpError';

export function authenticateJwt(req: Request, _res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) {
    return next(HttpError.unauthorized('Missing or invalid Authorization header'));
  }
  const token = h.slice(7).trim();
  if (!token) return next(HttpError.unauthorized('Missing bearer token'));

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as jwt.JwtPayload & {
      sub?: string;
      username?: string;
      role?: string;
    };
    if (!decoded.sub || typeof decoded.username !== 'string' || typeof decoded.role !== 'string') {
      return next(HttpError.unauthorized('Invalid token payload'));
    }
    req.authUser = { userId: decoded.sub, username: decoded.username, role: decoded.role };
    return next();
  } catch {
    return next(HttpError.unauthorized('Invalid or expired token'));
  }
}
