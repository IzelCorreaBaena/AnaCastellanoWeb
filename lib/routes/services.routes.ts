import { Router } from 'express';
import { servicesController } from '../controllers/services.controller';
import { authenticate, softAuthenticate } from '../middleware/auth';

const router = Router();

router.get('/', softAuthenticate, servicesController.list);
router.get('/:id', servicesController.get);
router.post('/', authenticate, servicesController.create);
router.put('/:id', authenticate, servicesController.update);
router.delete('/:id', authenticate, servicesController.remove);

export default router;
