import { Server } from 'socket.io';
import { createServer } from 'http';
import app from './server/app';
import mongoose from 'mongoose';
import { createServer as createViteServer } from 'vite';
import path from 'path';

import { NotificationService } from './server/services/notificationService';
import { EmailService } from './server/services/emailService';

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// Attach io to app to use in controllers
app.set('io', io);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join_dashboard', (userId) => {
    socket.join(`user_${userId}`);
    if (userId === 'admin') socket.join('admin_dashboard');
  });

  socket.on('join_focus_room', (roomId) => {
    socket.join(`focus_${roomId}`);
    io.to(`focus_${roomId}`).emit('user_joined_focus', socket.id);
  });

  socket.on('focus_sync_action', (data) => {
    // data: { roomId: string, action: string, payload: any }
    socket.to(`focus_${data.roomId}`).emit('focus_action_received', data);
  });


  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

async function startServer() {
  const PORT = 3000;
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/studyflow';

  try {
    // MongoDB completely bypassed. pure SQLite works
    // Initialize notification system
    await EmailService.init();
    NotificationService.init(io);
  } catch (err) {
    console.warn('Init failed:', err);
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // Serves static files in production
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[Realtime Industrial Server] Running at http://localhost:${PORT}`);
  });
}

startServer();
