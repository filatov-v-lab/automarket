import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import * as userService from '../services/userService';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.register(req.body.name, req.body.email, req.body.password);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.getUserProfile(req.userId!);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.updateUserProfile(req.userId!, req.body);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}
