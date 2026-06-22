import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/userService';

export async function getUsers(_req: Request, res: Response, next: NextFunction) {
  try {
    const users = await userService.getAllUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
}

export async function setUserRole(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.setUserRole(req.params.id, req.body.role as 'BUYER' | 'ADMIN');
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}
