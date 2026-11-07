import { Router } from 'express';
import { getDashboardStats, resetData } from '../controllers/dashboardController.ts';
import { authenticateToken } from '../middleware/auth.ts';

const router = Router();
router.use(authenticateToken);

router.get('/stats', getDashboardStats);
router.post('/reset-demo', resetData);

export default router;
