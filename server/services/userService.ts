import { User } from '../config/models';

export class UserService {
  static async getProfile(userId: string) {
    return await User.findById(userId).select('-password');
  }

  static async updateProfile(userId: string, data: any) {
    return await User.findByIdAndUpdate(userId, data, { new: true });
  }

  static async requestDeactivation(userId: string, days: number) {
    return await User.findByIdAndUpdate(userId, { deactivationRequest: days }, { new: true });
  }
}
