import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validate';
import { requireAuth } from '../middlewares/auth';
import * as ctrl from '../controllers/cartController';

const router = Router();

const addSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
});

const updateSchema = z.object({
  quantity: z.number().int().min(0),
});

router.use(requireAuth); // все маршруты корзины требуют авторизации

router.get('/', ctrl.getCart);
router.post('/', validate(addSchema), ctrl.addToCart);
router.put('/:productId', validate(updateSchema), ctrl.updateCartItem);
router.delete('/:productId', ctrl.removeFromCart);

export default router;
