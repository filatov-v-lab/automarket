import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

// Фабрика middleware: принимает zod-схему, возвращает middleware-валидатор
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        res.status(400).json({ success: false, message: 'Ошибка валидации', errors: messages });
        return;
      }
      next(err);
    }
  };
}
