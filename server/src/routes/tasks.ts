import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { TaskRunner } from '../engine/runner';

export default function createTasksRouter(runner: TaskRunner) {
  const router = Router();
  const prisma = new PrismaClient();

  // List all tasks
  router.get('/', async (req, res) => {
    try {
      const tasks = await prisma.task.findMany({
        orderBy: { createdAt: 'desc' },
        include: { agent: true, runs: true }
      });
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  });

  // Create a new task
  router.post('/', async (req, res) => {
    try {
      const { title, description, agentId, priority } = req.body;

      if (!title || !description || !agentId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const task = await prisma.task.create({
        data: {
          title,
          description,
          agentId,
          priority: priority || 'medium',
          status: 'pending'
        },
        include: { agent: true }
      });

      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create task' });
    }
  });

  // Execute a task
  router.post('/:id/run', async (req, res) => {
    try {
      const { id } = req.params;

      const task = await prisma.task.findUnique({
        where: { id },
        include: { agent: true }
      });

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Create a new run
      const run = await prisma.run.create({
        data: {
          taskId: id,
          agentId: task.agentId,
          status: 'starting'
        }
      });

      // Start the runner asynchronously
      runner.runTask(run.id).catch(err => {
        console.error(`Failed to run task ${id}:`, err);
      });

      res.status(202).json({ message: 'Task run started', run });
    } catch (error) {
      res.status(500).json({ error: 'Failed to run task' });
    }
  });

  // Get transcripts for a run
  router.get('/runs/:runId/transcripts', async (req, res) => {
    try {
      const { runId } = req.params;
      const transcripts = await prisma.transcript.findMany({
        where: { runId },
        orderBy: { timestamp: 'asc' }
      });
      res.json(transcripts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch transcripts' });
    }
  });

  return router;
}
