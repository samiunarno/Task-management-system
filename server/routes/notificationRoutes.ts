import { Router } from 'express';
import * as notificationController from '../controllers/notificationController';

const router = Router();

router.get('/:userId', notificationController.getNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.dismissNotification);
router.patch('/:userId/settings', notificationController.updateSettings);

export default router;
