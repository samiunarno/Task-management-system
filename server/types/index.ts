export interface User {
  id: number;
  email: string;
  role: 'Admin' | 'User';
  fullName: string;
  profilePhoto?: string;
  qrCode?: string;
  status: 'Active' | 'Banned' | 'Deactivated';
  deactivationRequest: number;
  createdAt: string;
}

export interface Routine {
  id: number;
  userId: number;
  type: 'Class' | 'Study' | 'Lunch' | 'Sleep';
  courseName?: string;
  isImportant: boolean;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
}

export interface Task {
  id: number;
  userId: number;
  title: string;
  description?: string;
  isDone: boolean;
  dueDate?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeRoutines: number;
  tasks: { name: string; value: number }[];
  latestActivity: { type: string; message: string }[];
}
