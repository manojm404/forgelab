import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all settings (Mask sensitive keys)
router.get('/', async (req, res) => {
  try {
    const settingsList = await prisma.setting.findMany();
    const settingsObj = settingsList.reduce((acc, s) => {
      let value = s.value;
      // Mask API Keys for security (only send first 6 and last 4 chars)
      if (s.key === 'GEMINI_API_KEY' && value.length > 10) {
        value = `${value.substring(0, 6)}...${value.substring(value.length - 4)}`;
      }
      return { ...acc, [s.key]: value };
    }, {});
    res.json(settingsObj);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update settings
router.post('/', async (req, res) => {
  try {
    const settings = req.body; // Expects an object like { GEMINI_API_KEY: '...', WORKSPACE_PATH: '...' }
    
    for (const [key, value] of Object.entries(settings)) {
      if (typeof value === 'string') {
        // Skip saving if the frontend sends back a masked key
        if (key === 'GEMINI_API_KEY' && value.includes('...')) {
          continue;
        }

        await prisma.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value }
        });
      }
    }
    
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
