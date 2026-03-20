import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const router = Router();
const prisma = new PrismaClient();

async function getWorkspacePath() {
  const setting = await prisma.setting.findUnique({ where: { key: 'WORKSPACE_PATH' } });
  return setting?.value || path.resolve(__dirname, '../../../workspace');
}

// List files in workspace
router.get('/', async (req, res) => {
  try {
    const workspacePath = await getWorkspacePath();
    const files = fs.readdirSync(workspacePath).map(file => ({
      name: file,
      isDirectory: fs.statSync(path.join(workspacePath, file)).isDirectory()
    }));
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Failed to list workspace' });
  }
});

// Read file content
router.get('/file', async (req, res) => {
  try {
    const { path: filePath } = req.query;
    const workspacePath = await getWorkspacePath();
    const fullPath = path.join(workspacePath, filePath as string);
    
    if (!fullPath.startsWith(workspacePath)) return res.status(403).json({ error: 'Access denied' });
    
    const content = fs.readFileSync(fullPath, 'utf8');
    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read file' });
  }
});

// Delete file
router.delete('/file', async (req, res) => {
  try {
    const { path: filePath } = req.body;
    const workspacePath = await getWorkspacePath();
    const fullPath = path.join(workspacePath, filePath as string);
    
    if (!fullPath.startsWith(workspacePath)) return res.status(403).json({ error: 'Access denied' });
    
    fs.unlinkSync(fullPath);
    res.json({ message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

export default router;
