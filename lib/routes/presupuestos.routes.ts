import { Router } from 'express';
import { presupuestosController } from '../controllers/presupuestos.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, presupuestosController.list);
router.post('/', authenticate, presupuestosController.create);
router.get('/:id/pdf', authenticate, presupuestosController.pdf);

export default router;
