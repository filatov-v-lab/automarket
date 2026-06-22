import { prisma } from '../config/db';
import { AppError } from '../middlewares/errorHandler';

export async function getWishlist(userId: string) {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    include: { product: { select: { id: true, name: true, price: true, images: true, stock: true, isActive: true } } },
  });
  return items.map((i) => i.product);
}

export async function toggleWishlist(userId: string, productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError(404, 'Товар не найден');

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { userId_productId: { userId, productId } } });
    return { inWishlist: false };
  } else {
    await prisma.wishlistItem.create({ data: { userId, productId } });
    return { inWishlist: true };
  }
}
