import { Router } from 'express';
import { blocksController } from '../controllers/blocks.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', blocksController.list);
router.get('/:id', blocksController.get);
router.post('/', authenticate, blocksController.create);
router.put('/:id', authenticate, blocksController.update);
router.delete('/:id', authenticate, blocksController.remove);

export default router;
