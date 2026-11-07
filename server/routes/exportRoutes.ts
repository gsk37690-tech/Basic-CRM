import { Router } from 'express';
import { getPostmanCollection, getAcademicSpecs } from '../controllers/exportController.ts';

const router = Router();

// Publicly accessible for submission download & documentation
router.get('/postman', getPostmanCollection);
router.get('/academic-specs', getAcademicSpecs);

export default router;
