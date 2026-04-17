import { Router } from 'express';
import { calendarController } from '../controllers/calendar.controller';

const router = Router();

router.get('/availability', calendarController.availability);

export default router;
