import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { contactoController } from '../controllers/contacto.controller';
import { authenticate } from '../middleware/auth';

const contactoLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Demasiados mensajes enviados. Inténtalo más tarde.',
    code: 'TOO_MANY_REQUESTS',
  },
});

const router = Router();

router.post('/', contactoLimiter, contactoController.create);
router.get('/', authenticate, contactoController.list);
router.put('/:id/read', authenticate, contactoController.markRead);

export default router;
