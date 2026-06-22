import { Request, Response, NextFunction } from 'express';
import * as cartService from '../services/cartService';

export async function getCart(req: Request, res: Response, next: NextFunction) {
  try {
    const cart = await cartService.getCart(req.userId!);
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
}

export async function addToCart(req: Request, res: Response, next: NextFunction) {
  try {
    const cart = await cartService.addToCart(req.userId!, req.body.productId, req.body.quantity);
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
}

export async function updateCartItem(req: Request, res: Response, next: NextFunction) {
  try {
    const cart = await cartService.updateCartItem(req.userId!, req.params.productId, req.body.quantity);
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
}

export async function removeFromCart(req: Request, res: Response, next: NextFunction) {
  try {
    const cart = await cartService.removeFromCart(req.userId!, req.params.productId);
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
}
