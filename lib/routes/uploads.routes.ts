import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  uploadImageMiddleware,
  uploadVideoMiddleware,
  uploadImage,
  uploadVideo,
} from '../controllers/uploads.controller';

const router = Router();

/**
 * POST /api/uploads/image
 * Admin-only. Accepts a single `image` field (JPEG / PNG / WebP, max 10 MB).
 * Returns { url: string } (Cloudinary secure URL).
 */
router.post('/image', authenticate, uploadImageMiddleware.single('image'), uploadImage);

/**
 * POST /api/uploads/video
 * Admin-only. Accepts a single `video` field (MP4 / WebM / OGG / MOV, max 100 MB).
 * Returns { url: string } (Cloudinary secure URL).
 */
router.post('/video', authenticate, uploadVideoMiddleware.single('video'), uploadVideo);

export default router;
