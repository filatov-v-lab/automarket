import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validate';
import { requireAuth, requireAdmin } from '../middlewares/auth';
import * as productCtrl from '../controllers/productController';
import * as categoryCtrl from '../controllers/categoryController';
import * as orderCtrl from '../controllers/orderController';
import * as adminCtrl from '../controllers/adminController';

const router = Router();

// Все маршруты adminRoutes требуют авторизации и роли admin
router.use(requireAuth, requireAdmin);

// Товары
const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
  category: z.string().min(1),
  stock: z.number().int().min(0),
  images: z.array(z.string()).optional(),
});

router.post('/products', validate(productSchema), productCtrl.createProduct);
router.put('/products/:id', validate(productSchema.partial()), productCtrl.updateProduct);
router.delete('/products/:id', productCtrl.deleteProduct);

// Категории
const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
});

router.post('/categories', validate(categorySchema), categoryCtrl.createCategory);
router.put('/categories/:id', validate(categorySchema.partial()), categoryCtrl.updateCategory);
router.delete('/categories/:id', categoryCtrl.deleteCategory);

// Заказы
router.get('/orders', orderCtrl.getAllOrders);
router.put('/orders/:id/status', validate(z.object({ status: z.string() })), orderCtrl.updateOrderStatus);

// Пользователи
router.get('/users', adminCtrl.getUsers);
router.put('/users/:id/role', validate(z.object({ role: z.enum(['BUYER', 'ADMIN']) })), adminCtrl.setUserRole);

export default router;
