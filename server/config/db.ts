import Database from 'better-sqlite3';
import path from 'path';

const db = new Database('studyflow.db');
db.pragma('journal_mode = WAL'); // Performance optimization

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'User',
    fullName TEXT,
    profilePhoto TEXT,
    qrCode TEXT,
    status TEXT DEFAULT 'Active',
    deactivationRequest INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS routines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    type TEXT,
    courseName TEXT,
    isImportant INTEGER DEFAULT 0,
    startTime TEXT,
    endTime TEXT,
    dayOfWeek TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    title TEXT,
    description TEXT,
    isDone INTEGER DEFAULT 0,
    dueDate TEXT,
    hasReminder INTEGER DEFAULT 0,
    reminderOffset INTEGER,
    reminderType TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id)
  );
`);

export default db;
