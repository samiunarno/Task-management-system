import { Request, Response, NextFunction } from 'express';
import { StudyService } from '../services/studyService';
import { ZhipuAIService } from '../services/aiService';

export const getRoutines = async (req: any, res: Response) => {
  const routines = await StudyService.getAllRoutines(req.user.id);
  res.json(routines);
};

export const addRoutine = async (req: any, res: Response) => {
  await StudyService.addRoutine(req.user.id, req.body);
  const io = req.app.get('io');
  io.to('admin_dashboard').emit('dashboard_update');
  io.to(`user_${req.user.id}`).emit('study_update');
  res.json({ message: 'Routine added' });
};

export const getTasks = async (req: any, res: Response) => {
  const tasks = await StudyService.getAllTasks(req.user.id);
  res.json(tasks);
};

export const addTask = async (req: any, res: Response) => {
  await StudyService.addTask(req.user.id, req.body);
  const io = req.app.get('io');
  io.to('admin_dashboard').emit('dashboard_update');
  io.to(`user_${req.user.id}`).emit('study_update');
  res.json({ message: 'Task added' });
};

export const updateTask = async (req: any, res: Response) => {
  if (req.body.isDone !== undefined && Object.keys(req.body).length === 1) {
    await StudyService.updateTaskStatus(req.user.id, req.params.id, req.body.isDone);
  } else {
    await StudyService.updateTask(req.user.id, req.params.id, req.body);
  }
  const io = req.app.get('io');
  io.to('admin_dashboard').emit('dashboard_update');
  io.to(`user_${req.user.id}`).emit('study_update');
  res.json({ message: 'Task updated' });
};

export const deleteTask = async (req: any, res: Response) => {
  await StudyService.deleteTask(req.user.id, req.params.id);
  const io = req.app.get('io');
  io.to('admin_dashboard').emit('dashboard_update');
  io.to(`user_${req.user.id}`).emit('study_update');
  res.json({ message: 'Task deleted' });
};

export const updateRoutine = async (req: any, res: Response) => {
  await StudyService.updateRoutine(req.user.id, req.params.id, req.body);
  const io = req.app.get('io');
  io.to('admin_dashboard').emit('dashboard_update');
  io.to(`user_${req.user.id}`).emit('study_update');
  res.json({ message: 'Routine updated' });
};

export const deleteRoutine = async (req: any, res: Response) => {
  await StudyService.deleteRoutine(req.user.id, req.params.id);
  const io = req.app.get('io');
  io.to('admin_dashboard').emit('dashboard_update');
  io.to(`user_${req.user.id}`).emit('study_update');
  res.json({ message: 'Routine deleted' });
};

export const getAIReport = async (req: any, res: Response, next: NextFunction) => {
  try {
    const report = await ZhipuAIService.generateStudyReport(req.user.id);
    res.json(report);
  } catch (err) {
    next(err);
  }
};
