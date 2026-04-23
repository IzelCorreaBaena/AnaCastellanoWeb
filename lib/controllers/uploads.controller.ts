import { v2 as cloudinary } from 'cloudinary';
import { RequestHandler } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { AppError } from '../middleware/errorHandler';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

// Cloudinary reads CLOUDINARY_URL from the environment automatically.

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
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});

export const uploadImage: RequestHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No se recibió ningún archivo', 400, 'MISSING_FILE'));
    }

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'anacastellano', resource_type: 'image' },
        (error, result) => {
          if (error || !result) return reject(error ?? new Error('Cloudinary upload failed'));
          resolve(result);
        },
      );
      stream.end(req.file!.buffer);
    });

    res.status(201).json({ url: result.secure_url });
  } catch (err) {
    next(err);
  }
};
