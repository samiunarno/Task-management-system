import db from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';

const JWT_SECRET = process.env.JWT_SECRET || 'study-secret-k3y';

export class AuthService {
  static async register(email: string, pass: string, fullName: string) {
    const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number };
    const role = userCount.c === 0 ? 'Admin' : 'User';
    const hashedPassword = await bcrypt.hash(pass, 10);
    
    const info = db.prepare('INSERT INTO users (email, password, role, fullName) VALUES (?, ?, ?, ?)').run(email, hashedPassword, role, fullName);
    const userId = info.lastInsertRowid;

    const qrData = JSON.stringify({ userId, email, seed: Math.random() });
    const qrCode = await QRCode.toDataURL(qrData);
    
    db.prepare('UPDATE users SET qrCode = ? WHERE id = ?').run(qrCode, userId);

    return { role, qrCode };
  }

  static async login(email: string, pass: string) {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user || !(await bcrypt.compare(pass, user.password))) throw new Error('Invalid credentials');
    if (user.status === 'Banned') throw new Error('Account banned');

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    return { token, user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName } };
  }

  static async qrLogin(qrData: string) {
    const data = JSON.parse(qrData);
    const user = db.prepare('SELECT * FROM users WHERE id = ? AND email = ?').get(data.userId, data.email) as any;
    if (!user) throw new Error('Invalid QR Code');
    if (user.status === 'Banned') throw new Error('Account banned');

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    return { token, user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName } };
  }

  // Biometrics are currently disabled for SQLite simplified version
  static async generateRegistrationOptions(email: string, rpID: string) { throw new Error("Not implemented"); }
  static async verifyRegistration(email: string, body: any, rpID: string, origin: string) { throw new Error("Not implemented"); }
  static async generateAuthenticationOptions(email: string, rpID: string) { throw new Error("Not implemented"); }
  static async verifyAuthentication(email: string, body: any, rpID: string, origin: string) { throw new Error("Not implemented"); }
}
