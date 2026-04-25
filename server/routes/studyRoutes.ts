import { Router } from 'express';
import * as studyController from '../controllers/studyController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/routines', studyController.getRoutines);
router.post('/routines', studyController.addRoutine);
router.patch('/routines/:id', studyController.updateRoutine);
router.delete('/routines/:id', studyController.deleteRoutine);

router.get('/tasks', studyController.getTasks);
router.post('/tasks', studyController.addTask);
router.patch('/tasks/:id', studyController.updateTask);
router.delete('/tasks/:id', studyController.deleteTask);

router.get('/ai-report', studyController.getAIReport);

export default router;
