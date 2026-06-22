import { Request, Response, NextFunction } from 'express';
import * as categoryService from '../services/categoryService';

export async function getCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await categoryService.getCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const cat = await categoryService.createCategory(req.body.name, req.body.slug, req.body.description);
    res.status(201).json({ success: true, data: cat });
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const cat = await categoryService.updateCategory(req.params.id, req.body);
    res.json({ success: true, data: cat });
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    await categoryService.deleteCategory(req.params.id);
    res.json({ success: true, message: 'Категория удалена' });
  } catch (err) {
    next(err);
  }
}
