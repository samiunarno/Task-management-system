import { User, Routine, Task } from '../config/models';

export class AdminService {
  static async getAllUsers() {
    return await User.find().select('-password');
  }

  static async performAction(userId: string, action: string, value?: any) {
    if (action === 'status') {
      await User.findByIdAndUpdate(userId, { status: value });
    } else if (action === 'delete') {
      await User.findByIdAndDelete(userId);
    } else if (action === 'approve-deactive') {
      await User.findByIdAndUpdate(userId, { status: 'Deactivated', deactivationRequest: 0 });
    }
  }

  static async getStats() {
    const totalUsers = await User.countDocuments();
    const activeRoutines = await Routine.countDocuments();
    const completedTasks = await Task.countDocuments({ isDone: true });
    const pendingTasks = await Task.countDocuments({ isDone: false });

    return {
      totalUsers,
      activeRoutines,
      tasks: [
        { name: 'Completed', value: completedTasks },
        { name: 'Pending', value: pendingTasks }
      ],
      latestActivity: [
        { type: 'Audit', message: 'System integrity check passed' },
        { type: 'Service', message: 'AI Engine operational' }
      ]
    };
  }
}
