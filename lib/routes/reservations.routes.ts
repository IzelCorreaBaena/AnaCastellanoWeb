import { Router } from 'express';
import { reservationsController } from '../controllers/reservations.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Pública: crear reserva desde el formulario del sitio
router.post('/', reservationsController.create);

// Admin
router.get('/', authenticate, reservationsController.list);
router.get('/:id', authenticate, reservationsController.get);
router.put('/:id', authenticate, reservationsController.update);
router.delete('/:id', authenticate, reservationsController.remove);

export default router;
