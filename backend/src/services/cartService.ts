import { prisma } from '../config/db';
import { AppError } from '../middlewares/errorHandler';

const cartInclude = {
  product: { select: { id: true, name: true, price: true, images: true, stock: true } },
};

function formatCart(items: { quantity: number; product: { id: string; name: string; price: any; images: string[]; stock: number } }[]) {
  let total = 0;
  const formatted = items.map((item) => {
    const lineTotal = Number(item.product.price) * item.quantity;
    total += lineTotal;
    return { ...item, lineTotal };
  });
  return { items: formatted, total };
}

export async function getCart(userId: string) {
  const items = await prisma.cartItem.findMany({ where: { userId }, include: cartInclude });
  return formatCart(items);
}

export async function addToCart(userId: string, productId: string, quantity: number) {
  const product = await prisma.product.findFirst({ where: { id: productId, isActive: true } });
  if (!product) throw new AppError(404, 'Товар не найден');

  const existing = await prisma.cartItem.findUnique({ where: { userId_productId: { userId, productId } } });
  const currentQty = existing?.quantity || 0;
  const newQty = currentQty + quantity;

  if (newQty > product.stock) throw new AppError(400, `Недостаточно товара. Доступно: ${product.stock}`);

  await prisma.cartItem.upsert({
    where: { userId_productId: { userId, productId } },
    update: { quantity: newQty },
    create: { userId, productId, quantity },
  });

  return getCart(userId);
}

export async function updateCartItem(userId: string, productId: string, quantity: number) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError(404, 'Товар не найден');
  if (quantity > product.stock) throw new AppError(400, `Недостаточно товара. Доступно: ${product.stock}`);

  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({ where: { userId, productId } });
  } else {
    await prisma.cartItem.update({ where: { userId_productId: { userId, productId } }, data: { quantity } });
  }

  return getCart(userId);
}

export async function removeFromCart(userId: string, productId: string) {
  await prisma.cartItem.deleteMany({ where: { userId, productId } });
  return getCart(userId);
}
