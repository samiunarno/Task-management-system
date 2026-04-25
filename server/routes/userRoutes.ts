import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.post('/update', userController.updateProfile);
router.post('/request-deactive', userController.requestDeactive);

export default router;
