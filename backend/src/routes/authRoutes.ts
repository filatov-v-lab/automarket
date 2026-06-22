import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validate';
import { requireAuth } from '../middlewares/auth';
import * as ctrl from '../controllers/authController';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(1, 'Имя обязательно'),
  email: z.string().email('Некорректный email'),
  password: z.string().min(8, 'Пароль минимум 8 символов'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  address: z
    .object({
      city: z.string().optional(),
      street: z.string().optional(),
      zip: z.string().optional(),
    })
    .optional(),
});

router.post('/register', validate(registerSchema), ctrl.register);
router.post('/login', validate(loginSchema), ctrl.login);
router.get('/me', requireAuth, ctrl.getMe);
router.put('/me', requireAuth, validate(updateProfileSchema), ctrl.updateMe);

export default router;
