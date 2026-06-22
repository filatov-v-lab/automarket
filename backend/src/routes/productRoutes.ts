import { Router } from 'express';
import * as ctrl from '../controllers/productController';

const router = Router();

// Публичные маршруты каталога
router.get('/', ctrl.getProducts);
router.get('/suggest', ctrl.suggestProducts); // должен быть до /:id
router.get('/:id', ctrl.getProduct);

export default router;
