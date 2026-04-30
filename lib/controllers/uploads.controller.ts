import { v2 as cloudinary } from 'cloudinary';
import { RequestHandler } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { AppError } from '../middleware/errorHandler';
import { env } from '../config/env';

const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_VIDEO_MIME_TYPES = new Set(['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']);
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;  // 10 MB
const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

const imageFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  if (ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Tipo de archivo no permitido. Solo se aceptan JPEG, PNG y WebP.', 400, 'INVALID_FILE_TYPE'));
  }
};

const videoFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  if (ALLOWED_VIDEO_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Tipo de archivo no permitido. Solo se aceptan MP4, WebM, OGG y MOV.', 400, 'INVALID_FILE_TYPE'));
  }
};

export const uploadImageMiddleware = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFilter,
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
});

export const uploadVideoMiddleware = multer({
  storage: multer.memoryStorage(),
  fileFilter: videoFilter,
  limits: { fileSize: MAX_VIDEO_SIZE_BYTES },
});

// Keep backward-compatible export used by existing routes
export const upload = uploadImageMiddleware;

export const uploadImage: RequestHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No se recibió ningún archivo', 400, 'MISSING_FILE'));
    }

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'anacastellano',
          resource_type: 'image',
          transformation: [
            { quality: 'auto:good', fetch_format: 'auto' },
            { width: 1920, crop: 'limit' },
          ],
        },
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

export const uploadVideo: RequestHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No se recibió ningún archivo', 400, 'MISSING_FILE'));
    }

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'anacastellano/videos',
          resource_type: 'video',
          transformation: [
            { quality: 'auto:good' },
            { width: 1920, crop: 'limit' },
          ],
        },
        (error, result) => {
          if (error || !result) return reject(error ?? new Error('Cloudinary video upload failed'));
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
