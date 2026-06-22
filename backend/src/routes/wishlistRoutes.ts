import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middlewares/auth';
import * as wishlistService from '../services/wishlistService';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await wishlistService.getWishlist(req.userId!);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST с productId — переключает: если нет — добавляет, если есть — убирает
router.post('/:productId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await wishlistService.toggleWishlist(req.userId!, req.params.productId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

export default router;
