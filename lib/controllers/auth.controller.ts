import { RequestHandler } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../db';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';

// Strict login input:
// - email: normalized to lowercase, max length bounded to prevent abuse
// - password: bounded min/max (bcrypt truncates at 72 bytes; reject anything above)
const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(6).max(128),
});

export const authController = {
  login: (async (req, res, next) => {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const admin = await prisma.admin.findUnique({ where: { email } });

      // Constant-ish time: always perform a bcrypt comparison, even on unknown user,
      // to avoid user-enumeration via response timing.
      const dummyHash = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8./uQnQOQxvM9zFrR/pr6s0vJh8e8K';
      const valid = await bcrypt.compare(password, admin?.passwordHash ?? dummyHash);

      if (!admin || !valid) {
        throw new AppError('Credenciales inválidas', 401, 'INVALID_CREDENTIALS');
      }

      // Minimal JWT payload: only the subject (admin id). Do NOT embed email/username
      // or any PII — the /me endpoint is the source of truth for profile data.
      const token = jwt.sign({ sub: admin.id }, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN,
      } as SignOptions);

      res.json({
        token,
        admin: { id: admin.id, username: admin.username, email: admin.email },
      });
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  me: (async (req, res, next) => {
    try {
      if (!req.admin) throw new AppError('Unauthorized', 401);
      // Explicit `select` — passwordHash is NEVER returned.
      const admin = await prisma.admin.findUnique({
        where: { id: req.admin.sub },
        select: { id: true, username: true, email: true, createdAt: true },
      });
      if (!admin) throw new AppError('Admin no encontrado', 404, 'NOT_FOUND');
      res.json(admin);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,
};
