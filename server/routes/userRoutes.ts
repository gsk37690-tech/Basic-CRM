import { Router } from 'express';
import { getUsers, updateUserRole } from '../controllers/userController.ts';
import { authenticateToken } from '../middleware/auth.ts';
import { requireRole } from '../middleware/role.ts';

const router = Router();
router.use(authenticateToken);

router.get('/', getUsers);
router.patch('/:id/role', requireRole(['Admin']), updateUserRole);

export default router;
