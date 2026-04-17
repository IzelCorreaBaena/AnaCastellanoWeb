import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { RequestHandler } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { AppError } from '../middleware/errorHandler';

// ─── Constants ────────────────────────────────────────────────────────────────

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);
// NOTE: disk storage only works in non-serverless environments; use cloud storage for Vercel.
const UPLOADS_DIR = path.join(_dirname, '../../uploads');

// ─── Ensure uploads directory exists at startup ───────────────────────────────

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ─── Multer configuration ─────────────────────────────────────────────────────

/**
 * Sanitize a filename by replacing any character that is not alphanumeric,
 * a dot, a hyphen, or an underscore with an underscore.
 */
function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const sanitized = sanitizeFilename(file.originalname);
    cb(null, `${Date.now()}-${sanitized}`);
  },
});

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Tipo de archivo no permitido. Solo se aceptan JPEG, PNG y WebP.', 400, 'INVALID_FILE_TYPE'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});

// ─── Handler ──────────────────────────────────────────────────────────────────

/**
 * POST /api/uploads/image
 * Requires authentication. Accepts multipart/form-data with field `image`.
 * Returns { url: '/uploads/<filename>' } on success.
 */
export const uploadImage: RequestHandler = (req, res, next) => {
  // multer errors (wrong type, too large) are forwarded via next() from the
  // upload middleware registered in the route — this handler only runs when
  // multer succeeded.
  if (!req.file) {
    return next(new AppError('No se recibió ningún archivo', 400, 'MISSING_FILE'));
  }

  res.status(201).json({ url: `/uploads/${req.file.filename}` });
};
