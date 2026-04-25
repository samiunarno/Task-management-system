import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'User'], default: 'User' },
  fullName: { type: String },
  profilePhoto: { type: String },
  qrCode: { type: String },
  status: { type: String, enum: ['Active', 'Banned', 'Deactivated'], default: 'Active' },
  deactivationRequest: { type: Number, default: 0 },
  currentChallenge: { type: String },
  biometricCredentials: [{
    credentialID: { type: Buffer },
    publicKey: { type: Buffer },
    counter: { type: Number },
    transports: [{ type: String }],
  }],
  notificationSettings: {
    email: { type: Boolean, default: true },
    inApp: { type: Boolean, default: true },
    reminderAdvanceMinutes: { type: Number, default: 30 }
  },
  createdAt: { type: Date, default: Date.now }
});

const RoutineSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['Class', 'Study', 'Lunch', 'Sleep'] },
  courseName: { type: String },
  isImportant: { type: Boolean, default: false },
  startTime: { type: String },
  endTime: { type: String },
  dayOfWeek: { type: String }
});

const TaskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  description: { type: String },
  isDone: { type: Boolean, default: false },
  dueDate: { type: Date },
  notified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  message: { type: String, required: true },
  type: { type: String, enum: ['TaskReminder', 'System', 'Security'], default: 'System' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', UserSchema);
export const Routine = mongoose.model('Routine', RoutineSchema);
export const Task = mongoose.model('Task', TaskSchema);
export const Notification = mongoose.model('Notification', NotificationSchema);
