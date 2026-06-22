import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validate';
import { requireAuth } from '../middlewares/auth';
import * as ctrl from '../controllers/orderController';

const router = Router();

const placeOrderSchema = z.object({
  deliveryAddress: z.object({
    city: z.string().min(1),
    street: z.string().min(1),
    zip: z.string().min(1),
  }),
  deliveryMethod: z.enum(['COURIER', 'PICKUP']),
  contactPhone: z.string().min(1),
  couponCode: z.string().optional(),
});

router.use(requireAuth);

router.post('/', validate(placeOrderSchema), ctrl.placeOrder);
router.get('/', ctrl.getUserOrders);
router.get('/:id', ctrl.getOrder);

export default router;
