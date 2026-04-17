import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { upload, uploadImage } from '../controllers/uploads.controller';

const router = Router();

/**
 * POST /api/uploads/image
 * Admin-only. Accepts a single `image` field (JPEG / PNG / WebP, max 5 MB).
 * Returns { url: '/uploads/<filename>' }.
 */
router.post('/image', authenticate, upload.single('image'), uploadImage);

export default router;
