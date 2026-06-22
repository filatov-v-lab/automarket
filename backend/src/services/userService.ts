import { prisma } from '../config/db';
import { AppError } from '../middlewares/errorHandler';

const safeSelect = {
  id: true, name: true, email: true, role: true,
  phone: true, city: true, street: true, zip: true,
  createdAt: true,
};

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: safeSelect });
  if (!user) throw new AppError(404, 'Пользователь не найден');
  return user;
}

export async function updateUserProfile(
  userId: string,
  data: { name?: string; phone?: string; city?: string; street?: string; zip?: string }
) {
  const user = await prisma.user.update({ where: { id: userId }, data, select: safeSelect });
  return user;
}

export async function getAllUsers() {
  return prisma.user.findMany({ select: safeSelect, orderBy: { createdAt: 'desc' } });
}

export async function setUserRole(userId: string, role: 'BUYER' | 'ADMIN') {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'Пользователь не найден');
  return prisma.user.update({ where: { id: userId }, data: { role }, select: safeSelect });
}
