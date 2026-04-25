import { Request, Response } from 'express';
import { AdminService } from '../services/adminService';

export const getUsers = async (req: Request, res: Response) => {
  const users = await AdminService.getAllUsers();
  res.json(users);
};

export const userAction = async (req: Request, res: Response) => {
  const { userId, action, value } = req.body;
  await AdminService.performAction(userId, action, value);
  const io = req.app.get('io');
  
  // Notify admin dashboard
  io.to('admin_dashboard').emit('dashboard_update');
  
  // Notify specific user if banned/deactivated
  if (action === 'status' || action === 'approve-deactive') {
    io.to(`user_${userId}`).emit('account_status_changed', { 
      status: action === 'approve-deactive' ? 'Deactivated' : value 
    });
  }
  
  res.json({ message: 'Action processed' });
};

export const getStats = async (req: Request, res: Response) => {
  const stats = await AdminService.getStats();
  res.json(stats);
};
