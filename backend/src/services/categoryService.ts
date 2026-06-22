import { prisma } from '../config/db';
import { AppError } from '../middlewares/errorHandler';

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
}

export async function createCategory(name: string, slug: string, description?: string) {
  return prisma.category.create({ data: { name, slug, description: description || '' } });
}

export async function updateCategory(id: string, data: { name?: string; slug?: string; description?: string }) {
  const cat = await prisma.category.findUnique({ where: { id } });
  if (!cat) throw new AppError(404, 'Категория не найдена');
  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string) {
  const cat = await prisma.category.findUnique({ where: { id } });
  if (!cat) throw new AppError(404, 'Категория не найдена');
  return prisma.category.delete({ where: { id } });
}
