import { Request, Response, NextFunction } from 'express';
import * as orderService from '../services/orderService';

export async function placeOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.placeOrder(req.userId!, req.body);
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
}

export async function getUserOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const orders = await orderService.getUserOrders(req.userId!);
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
}

export async function getOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.getOrderById(req.userId!, req.params.id);
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
}

export async function getAllOrders(_req: Request, res: Response, next: NextFunction) {
  try {
    const orders = await orderService.getAllOrders();
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
}

export async function updateOrderStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
}
