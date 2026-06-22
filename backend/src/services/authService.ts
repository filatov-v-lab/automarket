import bcrypt from 'bcrypt';
import { prisma } from '../config/db';
import { AppError } from '../middlewares/errorHandler';
import { signToken } from '../utils/jwt';
import { sendEmail } from '../utils/email';

const SALT_ROUNDS = 10;
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 10;

export async function register(name: string, email: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError(409, 'Email уже зарегистрирован');

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({ data: { name, email, passwordHash } });

  sendEmail(email, 'Добро пожаловать в AutoMarket', `Здравствуйте, ${name}! Вы успешно зарегистрированы.`);

  const token = signToken(user.id, user.role);
  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError(401, 'Неверный email или пароль');

  if (user.lockUntil && user.lockUntil > new Date()) {
    const minutesLeft = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
    throw new AppError(423, `Аккаунт заблокирован. Попробуйте через ${minutesLeft} мин.`);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    const attempts = user.loginAttempts + 1;
    const update =
      attempts >= MAX_ATTEMPTS
        ? { loginAttempts: 0, lockUntil: new Date(Date.now() + LOCK_MINUTES * 60 * 1000) }
        : { loginAttempts: attempts };
    await prisma.user.update({ where: { id: user.id }, data: update });
    throw new AppError(401, 'Неверный email или пароль');
  }

  await prisma.user.update({ where: { id: user.id }, data: { loginAttempts: 0, lockUntil: null } });

  const token = signToken(user.id, user.role);
  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}
