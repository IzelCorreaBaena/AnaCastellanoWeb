import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import multer from 'multer';
import { env } from '../config/env';

// ─── Custom error class ───────────────────────────────────────────────────────

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;

  constructor(message: string, statusCode = 400, code?: string) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    // Maintain proper prototype chain in transpiled ES5
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// ─── Prisma error helpers ─────────────────────────────────────────────────────

/** Map known Prisma client error codes to HTTP-friendly responses */
function handlePrismaError(err: Prisma.PrismaClientKnownRequestError): {
  status: number;
  message: string;
  code: string;
} {
  switch (err.code) {
    case 'P2025':
      // Record not found (e.g. update/delete on non-existent id)
      return { status: 404, message: 'Recurso no encontrado', code: 'NOT_FOUND' };
    case 'P2002': {
      // Unique constraint violation
      const fields = (err.meta?.target as string[] | undefined)?.join(', ') ?? 'campo';
      return {
        status: 409,
        message: `Ya existe un registro con ese valor en: ${fields}`,
        code: 'CONFLICT',
      };
    }
    case 'P2003':
      // Foreign key constraint failure
      return {
        status: 400,
        message: 'Referencia a un recurso que no existe',
        code: 'INVALID_REFERENCE',
      };
    case 'P2014':
      // Relation violation
      return {
        status: 400,
        message: 'La operación viola una restricción de relación',
        code: 'RELATION_VIOLATION',
      };
    default:
      return { status: 500, message: 'Error de base de datos', code: 'DB_ERROR' };
  }
}

// ─── Global error handler middleware ─────────────────────────────────────────

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (res.headersSent) return _next(err);
  const isProd = env.NODE_ENV === 'production';

  // Multer error — file too large, wrong type, etc.
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'El archivo supera el tamaño máximo permitido (5 MB)'
      : `Error al subir el archivo: ${err.message}`;
    return res.status(400).json({ success: false, error: message, code: 'UPLOAD_ERROR' });
  }

  // Zod validation error — return 400 with per-field messages
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Error de validación',
      code: 'VALIDATION_ERROR',
      issues: err.flatten().fieldErrors,
    });
  }

  // Custom application error
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(err.code ? { code: err.code } : {}),
    });
  }

  // Prisma known request error (P2xxx codes)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const { status, message, code } = handlePrismaError(err);
    if (!isProd) {
      console.error(`[prisma:${err.code}]`, err.meta, err.message);
    }
    return res.status(status).json({ success: false, error: message, code });
  }

  // Prisma validation error (malformed queries)
  if (err instanceof Prisma.PrismaClientValidationError) {
    console.error('[prisma:validation]', err.message);
    return res.status(400).json({
      success: false,
      error: 'Solicitud malformada',
      code: 'BAD_REQUEST',
    });
  }

  // Unknown / unexpected errors.
  // Log only name+message to avoid dumping objects that may contain
  // connection strings, request bodies, or other sensitive context.
  const safeName = err instanceof Error ? err.name : 'UnknownError';
  const safeMessage = err instanceof Error ? err.message : String(err);
  if (isProd) {
    console.error(`[error] ${req.method} ${req.path} :: ${safeName}`);
  } else {
    console.error(`[error] ${req.method} ${req.path} :: ${safeName}: ${safeMessage}`);
  }
  return res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    code: 'INTERNAL_ERROR',
    // Never expose error details (message or stack) in production.
    ...(isProd ? {} : { detail: safeMessage }),
  });
};
