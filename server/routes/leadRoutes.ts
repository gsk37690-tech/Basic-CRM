import { Router } from 'express';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  convertLead,
} from '../controllers/leadController.ts';
import { authenticateToken } from '../middleware/auth.ts';
import { requireRole } from '../middleware/role.ts';

const router = Router();

router.use(authenticateToken);

router.get('/', getLeads);
router.get('/:id', getLeadById);
router.post('/', createLead);
router.put('/:id', updateLead);
router.delete('/:id', requireRole(['Admin', 'Sales Manager']), deleteLead);
router.post('/:id/convert', convertLead);

export default router;
