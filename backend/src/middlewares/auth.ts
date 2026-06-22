import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';

// Добавляем поле userId и role к объекту Request
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError(401, 'Нет токена авторизации'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string };
    req.userId = payload.userId;
    req.userRole = payload.role;
    next();
  } catch {
    next(new AppError(401, 'Токен недействителен или истёк'));
  }
}

// Проверка роли admin — вызывается после requireAuth
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (req.userRole !== 'admin') {
    return next(new AppError(403, 'Доступ только для администраторов'));
  }
  next();
}
