import { PrismaClient } from '@prisma/client';

// Единый экземпляр клиента на всё приложение
export const prisma = new PrismaClient();

export async function connectDB(): Promise<void> {
  await prisma.$connect();
  console.log('PostgreSQL connected via Prisma');
}
