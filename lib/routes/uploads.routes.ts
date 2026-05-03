import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { upload, uploadImage } from '../controllers/uploads.controller';

const router = Router();

/**
 * POST /api/uploads/image
 * Admin-only. Accepts images (JPEG/PNG/WebP ≤5 MB) and videos (MP4/WebM/MOV ≤100 MB).
 * Returns { url: string } — Cloudinary secure URL.
 */
router.post('/image', authenticate, upload.single('image'), uploadImage);

/**
 * POST /api/uploads/media  (alias — same handler, accepts both images and videos)
 */
router.post('/media', authenticate, upload.single('image'), uploadImage);

export default router;
