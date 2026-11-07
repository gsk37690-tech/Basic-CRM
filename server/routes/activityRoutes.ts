import { Router } from 'express';
import { getActivities, createActivity } from '../controllers/activityController.ts';
import { authenticateToken } from '../middleware/auth.ts';

const router = Router();
router.use(authenticateToken);

router.get('/', getActivities);
router.post('/', createActivity);

export default router;
