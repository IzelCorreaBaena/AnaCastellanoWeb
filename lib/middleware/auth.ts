import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './errorHandler';
import { AuthTokenPayload } from '../types';

// ─── Augment Express Request ──────────────────────────────────────────────────

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: AuthTokenPayload;
    }
  }
}

// ─── Auth middleware ──────────────────────────────────────────────────────────

/**
 * Extracts and verifies the Bearer JWT from the Authorization header.
 * On success, populates `req.admin` with the token payload.
 * Returns 401 when the token is missing, invalid, or expired.
 * (RFC 6750: all unauthenticated states use 401; 403 is reserved for authenticated but unauthorised.)
 */
export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return next(new AppError('Token de autenticación requerido', 401, 'MISSING_TOKEN'));
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
    req.admin = payload;
    return next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(new AppError('Token expirado, inicia sesión nuevamente', 401, 'TOKEN_EXPIRED'));
    }
    return next(new AppError('Token inválido', 401, 'INVALID_TOKEN'));
  }
};

/** Alias kept for semantic clarity in protected routes */
export const requireAdmin = authenticate;
