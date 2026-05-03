import { v2 as cloudinary } from 'cloudinary';
import { RequestHandler } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { AppError } from '../middleware/errorHandler';

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime']);
const ALLOWED_MIME_TYPES = new Set([...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES]);

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;   // 5 MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB

// Cloudinary reads CLOUDINARY_URL from the environment automatically.

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(
      'Tipo de archivo no permitido. Se aceptan imágenes (JPEG, PNG, WebP) y vídeos (MP4, WebM, MOV).',
      400,
      'INVALID_FILE_TYPE',
    ));
  }
};

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: MAX_VIDEO_SIZE },
});

export const uploadImage: RequestHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No se recibió ningún archivo', 400, 'MISSING_FILE'));
    }

    const isVideo = ALLOWED_VIDEO_TYPES.has(req.file.mimetype);

    if (!isVideo && req.file.size > MAX_IMAGE_SIZE) {
      return next(new AppError('La imagen no puede superar 5 MB', 400, 'FILE_TOO_LARGE'));
    }

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'anacastellano',
          resource_type: isVideo ? 'video' : 'image',
        },
        (error, result) => {
          if (error || !result) {
            const msg = error?.message ?? 'No result returned';
            console.error('[cloudinary] upload failed:', msg);
            return reject(new AppError(`Error al subir el archivo a Cloudinary: ${msg}`, 502, 'CLOUDINARY_ERROR'));
          }
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
