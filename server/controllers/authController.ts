import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2)
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const result = await AuthService.register(validatedData.email, validatedData.password, validatedData.fullName);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const qrLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { qrData } = req.body;
    const result = await AuthService.qrLogin(qrData);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const generateRegistrationOptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const rpID = req.headers.host?.split(':')[0] || 'localhost';
    const options = await AuthService.generateRegistrationOptions(email, rpID);
    res.json(options);
  } catch (err) {
    next(err);
  }
};

export const verifyRegistration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, body } = req.body;
    const rpID = req.headers.host?.split(':')[0] || 'localhost';
    const origin = req.headers.origin || `http://${req.headers.host}`;
    const result = await AuthService.verifyRegistration(email, body, rpID, origin);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const generateAuthenticationOptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const rpID = req.headers.host?.split(':')[0] || 'localhost';
    const options = await AuthService.generateAuthenticationOptions(email, rpID);
    res.json(options);
  } catch (err) {
    next(err);
  }
};

export const verifyAuthentication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, body } = req.body;
    const rpID = req.headers.host?.split(':')[0] || 'localhost';
    const origin = req.headers.origin || `http://${req.headers.host}`;
    const result = await AuthService.verifyAuthentication(email, body, rpID, origin);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
