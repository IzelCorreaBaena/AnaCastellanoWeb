import { Router } from 'express';
import { cursosController } from '../controllers/cursos.controller';
import { authenticate, softAuthenticate } from '../middleware/auth';

const router = Router();

router.get('/', softAuthenticate, cursosController.list);
router.get('/:id', cursosController.get);
router.post('/', authenticate, cursosController.create);
router.put('/:id', authenticate, cursosController.update);
router.delete('/:id', authenticate, cursosController.remove);

export default router;
