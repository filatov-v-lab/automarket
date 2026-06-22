import express from 'express';
import cors from 'cors';
import path from 'path';
import { errorHandler } from './middlewares/errorHandler';

import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes';
import adminRoutes from './routes/adminRoutes';
import wishlistRoutes from './routes/wishlistRoutes';
import couponRoutes from './routes/couponRoutes';

const app = express();

app.use(cors());
app.use(express.json());

// Подключаем маршруты с общим префиксом /api
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/coupons', couponRoutes);

// Раздаём фронтенд из корня проекта (папка выше backend/)
app.use(express.static(path.join(__dirname, '../../')));

// Централизованный обработчик ошибок — должен быть последним
app.use(errorHandler);

export default app;
