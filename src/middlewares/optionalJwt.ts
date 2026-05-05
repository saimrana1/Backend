import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

/**
 * Optional JWT — attaches `req.authUser` if a valid token is present,
 * but does NOT reject the request when the token is missing or invalid.
 * Useful for public routes that behave differently for logged-in users
 * (e.g. showing whether a user has already liked a coupon).
 */
export function optionalJwt(req: Request, _res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return next();

  const token = h.slice(7).trim();
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as jwt.JwtPayload & {
      sub?: string;
      username?: string;
      role?: string;
    };
    if (decoded.sub && typeof decoded.username === 'string' && typeof decoded.role === 'string') {
      req.authUser = { userId: decoded.sub, username: decoded.username, role: decoded.role };
    }
  } catch {
    // Token invalid or expired — silently ignore
  }

  return next();
}
