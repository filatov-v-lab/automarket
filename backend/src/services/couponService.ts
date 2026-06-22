import { prisma } from '../config/db';
import { AppError } from '../middlewares/errorHandler';

export async function applyCoupon(code: string, originalPrice: number) {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  if (!coupon || !coupon.isActive) throw new AppError(404, 'Промокод не найден или неактивен');
  if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new AppError(400, 'Промокод истёк');
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw new AppError(400, 'Лимит использований исчерпан');
  }

  const val = Number(coupon.value);
  const discount = coupon.type === 'PERCENT' ? Math.round(originalPrice * (val / 100)) : val;
  const finalPrice = Math.max(0, originalPrice - discount);
  return { discount, finalPrice, couponId: coupon.id };
}

export async function incrementUsage(couponId: string) {
  await prisma.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } });
}

export async function createCoupon(data: {
  code: string; type: 'PERCENT' | 'FIXED'; value: number;
  expiresAt?: Date; usageLimit?: number;
}) {
  return prisma.coupon.create({ data: { ...data, code: data.code.toUpperCase() } });
}

export async function getCoupons() {
  return prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function deleteCoupon(id: string) {
  const c = await prisma.coupon.findUnique({ where: { id } });
  if (!c) throw new AppError(404, 'Купон не найден');
  return prisma.coupon.delete({ where: { id } });
}
