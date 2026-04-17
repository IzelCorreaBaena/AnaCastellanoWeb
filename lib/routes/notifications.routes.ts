import { Router } from 'express';
import { notificationsController } from '../controllers/notifications.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, notificationsController.summary);

export default router;
