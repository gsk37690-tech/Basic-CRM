import { Router } from 'express';
import {
  getFollowUps,
  createFollowUp,
  updateFollowUp,
  deleteFollowUp,
} from '../controllers/followUpController.ts';
import { authenticateToken } from '../middleware/auth.ts';

const router = Router();
router.use(authenticateToken);

router.get('/', getFollowUps);
router.post('/', createFollowUp);
router.patch('/:id', updateFollowUp);
router.put('/:id', updateFollowUp);
router.delete('/:id', deleteFollowUp);

export default router;
