import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validate';
import { requireAuth, requireAdmin } from '../middlewares/auth';
import * as couponService from '../services/couponService';

const router = Router();

// Проверить купон (авторизованный пользователь передаёт код и сумму)
router.post('/check', requireAuth, validate(z.object({ code: z.string(), price: z.number().min(0) })),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await couponService.applyCoupon(req.body.code, req.body.price);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  }
);

// Админ: список купонов
router.get('/', requireAuth, requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await couponService.getCoupons();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// Админ: создать купон
const createSchema = z.object({
  code: z.string().min(1),
  type: z.enum(['PERCENT', 'FIXED']),
  value: z.number().min(0),
  expiresAt: z.string().optional().transform(v => v ? new Date(v) : undefined),
  usageLimit: z.number().int().min(1).optional(),
});

router.post('/', requireAuth, requireAdmin, validate(createSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const coupon = await couponService.createCoupon(req.body);
      res.status(201).json({ success: true, data: coupon });
    } catch (err) { next(err); }
  }
);

// Админ: удалить купон
router.delete('/:id', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await couponService.deleteCoupon(req.params.id);
    res.json({ success: true, message: 'Купон удалён' });
  } catch (err) { next(err); }
});

export default router;
