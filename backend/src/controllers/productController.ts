import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/productService';

export async function getProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { categoryId, minPrice, maxPrice, inStock, search, sortBy, page, limit } = req.query as Record<string, string>;
    const result = await productService.getProducts({
      categoryId,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      inStock: inStock === 'true',
      search,
      sortBy: sortBy as any,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function getProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
}

export async function suggestProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) { res.json({ success: true, data: [] }); return; }
    const items = await productService.suggestProducts(q);
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
}

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) { next(err); }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    await productService.deleteProduct(req.params.id);
    res.json({ success: true, message: 'Товар удалён' });
  } catch (err) { next(err); }
}
