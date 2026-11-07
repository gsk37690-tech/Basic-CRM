import { Router } from 'express';
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from '../controllers/contactController.ts';
import { authenticateToken } from '../middleware/auth.ts';
import { requireRole } from '../middleware/role.ts';

const router = Router();
router.use(authenticateToken);

router.get('/', getContacts);
router.get('/:id', getContactById);
router.post('/', createContact);
router.put('/:id', updateContact);
router.delete('/:id', requireRole(['Admin', 'Sales Manager']), deleteContact);

export default router;
