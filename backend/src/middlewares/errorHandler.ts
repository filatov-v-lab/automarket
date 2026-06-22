import { Request, Response, NextFunction } from 'express';

// Кастомный класс ошибки с HTTP-кодом
export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'AppError';
  }
}

// Единый обработчик ошибок — все контроллеры кидают ошибку через next(err)
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  // Ошибка валидации Mongoose (например, уникальный ключ)
  if (typeof err === 'object' && err !== null && 'code' in err && (err as any).code === 11000) {
    res.status(409).json({ success: false, message: 'Такое значение уже существует' });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
}
