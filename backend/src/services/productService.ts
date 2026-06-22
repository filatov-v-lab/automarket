import { prisma } from '../config/db';
import { AppError } from '../middlewares/errorHandler';
import { Prisma } from '@prisma/client';

interface ProductFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc';
  page?: number;
  limit?: number;
}

export async function getProducts(filters: ProductFilters) {
  const where: Prisma.ProductWhereInput = { isActive: true };

  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.inStock) where.stock = { gt: 0 };
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) (where.price as any).gte = filters.minPrice;
    if (filters.maxPrice !== undefined) (where.price as any).lte = filters.maxPrice;
  }
  // Полнотекстовый поиск через ILIKE по названию и описанию
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const sortMap: Record<string, Prisma.ProductOrderByWithRelationInput> = {
    price_asc: { price: 'asc' },
    price_desc: { price: 'desc' },
    name_asc: { name: 'asc' },
    name_desc: { name: 'desc' },
  };
  const orderBy = filters.sortBy ? sortMap[filters.sortBy] : { createdAt: 'desc' as const };

  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({ where, orderBy, skip, take: limit, include: { category: { select: { name: true, slug: true } } } }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, pages: Math.ceil(total / limit) };
}

export async function getProductById(id: string) {
  const product = await prisma.product.findFirst({
    where: { id, isActive: true },
    include: { category: { select: { name: true, slug: true } } },
  });
  if (!product) throw new AppError(404, 'Товар не найден');
  return product;
}

export async function suggestProducts(search: string) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      name: { contains: search, mode: 'insensitive' },
    },
    select: { id: true, name: true },
    take: 8,
  });
}

export async function createProduct(data: {
  name: string; description?: string; price: number;
  categoryId: string; stock: number; images?: string[];
}) {
  return prisma.product.create({ data: { ...data, images: data.images || [] } });
}

export async function updateProduct(id: string, data: {
  name?: string; description?: string; price?: number;
  categoryId?: string; stock?: number; images?: string[]; isActive?: boolean;
}) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError(404, 'Товар не найден');
  return prisma.product.update({ where: { id }, data });
}

export async function deleteProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError(404, 'Товар не найден');
  return prisma.product.update({ where: { id }, data: { isActive: false } });
}
