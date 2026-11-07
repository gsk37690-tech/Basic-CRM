import { Router } from 'express';
import {
  getDeals,
  getDealById,
  createDeal,
  updateDeal,
  deleteDeal,
} from '../controllers/dealController.ts';
import { authenticateToken } from '../middleware/auth.ts';
import { requireRole } from '../middleware/role.ts';

const router = Router();
router.use(authenticateToken);

router.get('/', getDeals);
router.get('/:id', getDealById);
router.post('/', createDeal);
router.put('/:id', updateDeal);
router.delete('/:id', requireRole(['Admin', 'Sales Manager']), deleteDeal);

export default router;
