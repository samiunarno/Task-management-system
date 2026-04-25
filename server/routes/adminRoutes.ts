import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorize(['Admin']));

router.get('/users', adminController.getUsers);
router.post('/user-action', adminController.userAction);
router.get('/stats', adminController.getStats);

export default router;
