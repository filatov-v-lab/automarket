import { Router } from 'express';
import * as ctrl from '../controllers/categoryController';

const router = Router();

// Публичный список категорий
router.get('/', ctrl.getCategories);

export default router;
