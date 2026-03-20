import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get current team (mocked for now, will implement logic to select team)
router.get('/current', async (req, res) => {
  try {
    const team = await prisma.team.findFirst({
      include: { members: { include: { agent: true } }, tasks: true }
    });
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

export default router;
