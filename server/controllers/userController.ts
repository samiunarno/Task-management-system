import { Request, Response } from 'express';
import { UserService } from '../services/userService';

export const getProfile = async (req: any, res: Response) => {
  const profile = await UserService.getProfile(req.user.id);
  res.json(profile);
};

export const updateProfile = async (req: any, res: Response) => {
  await UserService.updateProfile(req.user.id, req.body);
  res.json({ message: 'Profile updated' });
};

export const requestDeactive = async (req: any, res: Response) => {
  await UserService.requestDeactivation(req.user.id, req.body.days);
  const io = req.app.get('io');
  io.to('admin_dashboard').emit('dashboard_update');
  res.json({ message: 'Request sent' });
};
