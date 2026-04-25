import { Router } from 'express';
import * as authController from '../controllers/authController';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/qr-login', authController.qrLogin);

// Biometric Routes
router.post('/biometric/register-options', authController.generateRegistrationOptions);
router.post('/biometric/register-verify', authController.verifyRegistration);
router.post('/biometric/login-options', authController.generateAuthenticationOptions);
router.post('/biometric/login-verify', authController.verifyAuthentication);

export default router;
