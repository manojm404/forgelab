import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

import agentsRouter from './src/routes/agents';
import createTasksRouter from './src/routes/tasks';
import settingsRouter from './src/routes/settings';
import dashboardRouter from './src/routes/dashboard';
import workspaceRouter from './src/routes/workspace';
import teamsRouter from './src/routes/teams';
import { TaskRunner } from './src/engine/runner';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Configure Socket.io with strict CORS for security
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const prisma = new PrismaClient();

// Strict CORS for Express
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174']
}));
app.use(express.json());

// Initialize the Task Runner with Socket.io
const runner = new TaskRunner(io);

// API Routes
app.use('/api/agents', agentsRouter);
app.use('/api/tasks', createTasksRouter(runner));
app.use('/api/settings', settingsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/teams', teamsRouter);

const PORT = process.env.PORT || 3001;

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Bind explicitly to 127.0.0.1 to prevent external network exposure
httpServer.listen(Number(PORT), '127.0.0.1', () => {
  console.log(`ForgeLab Server running securely on 127.0.0.1:${PORT}`);
  console.log(`API available at http://127.0.0.1:${PORT}/api`);
});
