import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/stats', async (req, res) => {
  try {
    const agentsCount = await prisma.agent.count();
    const activeTasksCount = await prisma.task.count({ where: { status: 'in-progress' } });
    const completedTasksCount = await prisma.task.count({ where: { status: 'completed' } });
    
    const recentActivity = await prisma.run.findMany({
      orderBy: { startedAt: 'desc' },
      take: 5,
      include: {
        agent: true,
        task: true,
        transcripts: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    });

    res.json({
      agents: agentsCount,
      activeTasks: activeTasksCount,
      completedTasks: completedTasksCount,
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router;
