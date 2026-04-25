import db from '../config/db';

export class StudyService {
  static async getAllRoutines(userId: string) {
    return db.prepare('SELECT * FROM routines WHERE userId = ?').all(userId);
  }

  static async addRoutine(userId: string, data: any) {
    const info = db.prepare('INSERT INTO routines (userId, type, courseName, isImportant, startTime, endTime, dayOfWeek) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(userId, data.type, data.courseName, data.isImportant ? 1 : 0, data.startTime, data.endTime, data.dayOfWeek);
    return db.prepare('SELECT * FROM routines WHERE id = ?').get(info.lastInsertRowid);
  }

  static async getAllTasks(userId: string) {
    const tasks = db.prepare('SELECT * FROM tasks WHERE userId = ? ORDER BY createdAt DESC').all(userId) as any[];
    return tasks.map(t => ({
      ...t,
      isDone: t.isDone === 1,
      hasReminder: t.hasReminder === 1
    }));
  }

  static async addTask(userId: string, data: any) {
    const info = db.prepare('INSERT INTO tasks (userId, title, description, dueDate, hasReminder, reminderOffset, reminderType) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(userId, data.title, data.description, data.dueDate, data.hasReminder ? 1 : 0, data.reminderOffset, data.reminderType);
    return db.prepare('SELECT * FROM tasks WHERE id = ?').get(info.lastInsertRowid);
  }

  static async updateTaskStatus(userId: string, taskId: string, isDone: boolean) {
    db.prepare('UPDATE tasks SET isDone = ? WHERE id = ? AND userId = ?').run(isDone ? 1 : 0, taskId, userId);
    return db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
  }

  static async updateTask(userId: string, taskId: string, data: any) {
    db.prepare('UPDATE tasks SET title = ?, description = ?, dueDate = ?, hasReminder = ?, reminderOffset = ?, reminderType = ? WHERE id = ? AND userId = ?')
      .run(data.title, data.description, data.dueDate, data.hasReminder ? 1 : 0, data.reminderOffset, data.reminderType, taskId, userId);
    return db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
  }

  static async deleteTask(userId: string, taskId: string) {
    return db.prepare('DELETE FROM tasks WHERE id = ? AND userId = ?').run(taskId, userId);
  }

  static async updateRoutine(userId: string, routineId: string, data: any) {
    db.prepare('UPDATE routines SET type = ?, courseName = ?, isImportant = ?, startTime = ?, endTime = ?, dayOfWeek = ? WHERE id = ? AND userId = ?')
      .run(data.type, data.courseName, data.isImportant ? 1 : 0, data.startTime, data.endTime, data.dayOfWeek, routineId, userId);
    return db.prepare('SELECT * FROM routines WHERE id = ?').get(routineId);
  }

  static async deleteRoutine(userId: string, routineId: string) {
    return db.prepare('DELETE FROM routines WHERE id = ? AND userId = ?').run(routineId, userId);
  }
}
