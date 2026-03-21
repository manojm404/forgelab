import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get current team (most recently active)
router.get('/current', async (req, res) => {
  try {
    const team = await prisma.team.findFirst({
      orderBy: { updatedAt: 'desc' },
      include: {
        members: { include: { agent: true } },
        tasks: { orderBy: { createdAt: 'desc' } },
        blackboard: true
      }
    });
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// Create new team
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    const team = await prisma.team.create({
      data: {
        name,
        description,
        status: 'active'
      }
    });

    // Initialize Blackboard
    await prisma.blackboard.create({
      data: {
        teamId: team.id,
        data: '{}',
        messages: '[]'
      }
    });

    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create team' });
  }
});

export default router;
