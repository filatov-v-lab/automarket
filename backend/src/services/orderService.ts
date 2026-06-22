import { prisma } from '../config/db';
import { AppError } from '../middlewares/errorHandler';
import { sendEmail } from '../utils/email';
import { applyCoupon, incrementUsage } from './couponService';

interface PlaceOrderData {
  deliveryAddress: { city: string; street: string; zip: string };
  deliveryMethod: 'COURIER' | 'PICKUP';
  contactPhone: string;
  couponCode?: string;
}

export async function placeOrder(userId: string, data: PlaceOrderData) {
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
  });

  if (cartItems.length === 0) throw new AppError(400, 'Корзина пуста');

  // Всё внутри PostgreSQL-транзакции — атомарно (НТ-04)
  const order = await prisma.$transaction(async (tx) => {
    let totalPrice = 0;
    const orderItemsData = [];

    for (const item of cartItems) {
      // Проверяем и списываем остаток атомарно
      const updated = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity }, isActive: true },
        data: { stock: { decrement: item.quantity } },
      });

      if (updated.count === 0) {
        throw new AppError(400, `Товар "${item.product.name}" недоступен или недостаточно на складе`);
      }

      const lineTotal = Number(item.product.price) * item.quantity;
      totalPrice += lineTotal;
      orderItemsData.push({
        productId: item.productId,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      });
    }

    // Применяем купон
    let finalPrice = totalPrice;
    let couponId: string | undefined;
    if (data.couponCode) {
      const couponResult = await applyCoupon(data.couponCode, totalPrice);
      finalPrice = couponResult.finalPrice;
      couponId = couponResult.couponId;
    }

    const order = await tx.order.create({
      data: {
        userId,
        totalPrice: finalPrice,
        deliveryCity: data.deliveryAddress.city,
        deliveryStreet: data.deliveryAddress.street,
        deliveryZip: data.deliveryAddress.zip,
        deliveryMethod: data.deliveryMethod,
        contactPhone: data.contactPhone,
        items: { create: orderItemsData },
      },
      include: { items: true },
    });

    // Очищаем корзину
    await tx.cartItem.deleteMany({ where: { userId } });

    return { order, couponId };
  });

  if (order.couponId) await incrementUsage(order.couponId);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    sendEmail(user.email, `Заказ #${order.order.id} оформлен`,
      `Ваш заказ на сумму ${order.order.totalPrice} ₽ принят.`);
  }

  return order.order;
}

export async function getUserOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getOrderById(userId: string, orderId: string, isAdmin = false) {
  const where = isAdmin ? { id: orderId } : { id: orderId, userId };
  const order = await prisma.order.findFirst({ where, include: { items: true } });
  if (!order) throw new AppError(404, 'Заказ не найден');
  return order;
}

export async function getAllOrders() {
  return prisma.order.findMany({
    include: { items: true, user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateOrderStatus(orderId: string, status: string) {
  const allowed = ['NEW', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'];
  if (!allowed.includes(status)) throw new AppError(400, 'Недопустимый статус');
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError(404, 'Заказ не найден');
  return prisma.order.update({ where: { id: orderId }, data: { status: status as any } });
}
