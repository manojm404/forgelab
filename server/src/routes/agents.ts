import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { ContextManager } from '../engine/contextManager';

const router = Router();
const prisma = new PrismaClient();
const contextManager = new ContextManager(path.resolve(__dirname, '../../../workspace'));

// Helper to get workspace path from settings or fallback
async function getWorkspacePath() {
  const setting = await prisma.setting.findUnique({ where: { key: 'WORKSPACE_PATH' } });
  return setting?.value || path.resolve(__dirname, '../../../workspace');
}

// Utility: Prevent Path Traversal
function isValidAgentName(name: string): boolean {
  // Only allow alphanumeric, dashes, and underscores. No slashes or dots that could lead to traversal.
  return /^[a-zA-Z0-9_-]+$/.test(name);
}

// List all agents
router.get('/', async (req, res) => {
  try {
    const agents = await prisma.agent.findMany({
      orderBy: { createdAt: 'desc' },
      include: { tasks: true, runs: true }
    });
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// Get single agent
router.get('/:id', async (req, res) => {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: req.params.id },
      include: { tasks: { orderBy: { createdAt: 'desc' } }, runs: { orderBy: { startedAt: 'desc' }, take: 5 } }
    });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    res.json(agent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch agent' });
  }
});

// Create new agent (Hire Agent)
router.post('/', async (req, res) => {
  try {
    const { name, role, identity, soul, model } = req.body;
    
    if (!name || !role) {
      return res.status(400).json({ error: 'Name and role are required' });
    }

    if (!isValidAgentName(name)) {
      return res.status(400).json({ error: 'Invalid agent name. Use only alphanumeric characters, dashes, and underscores.' });
    }

    // DB Create
    const agent = await prisma.agent.create({
      data: {
        name,
        role,
        identity: identity || `# IDENTITY.md - Who Am I?\n\n- **Name:** ${name}\n- **Role:** ${role}`,
        soul: soul || `# SOUL.md - Who You Are\n\nBe genuinely helpful.`,
        model: model || 'gemini-1.5-flash'
      }
    });

    // File System Create (Safe because name is validated)
    const workspacePath = await getWorkspacePath();
    const agentDir = path.join(workspacePath, 'agents', name);
    
    if (!fs.existsSync(agentDir)) {
      fs.mkdirSync(agentDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(agentDir, 'IDENTITY.md'), agent.identity!);
    fs.writeFileSync(path.join(agentDir, 'SOUL.md'), agent.soul!);

    await contextManager.updateContext();
    res.status(201).json(agent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to hire agent' });
  }
});

// Update single agent
router.put('/:id', async (req, res) => {
  try {
    const { identity, soul, role, model } = req.body;
    
    const agent = await prisma.agent.findUnique({ where: { id: req.params.id } });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    if (!isValidAgentName(agent.name)) {
      return res.status(400).json({ error: 'Stored agent name is invalid. Aborting file operations.' });
    }

    // DB Update
    const updated = await prisma.agent.update({
      where: { id: req.params.id },
      data: { identity, soul, role, model }
    });

    // File System Update (Safe because name is validated)
    const workspacePath = await getWorkspacePath();
    const agentDir = path.join(workspacePath, 'agents', agent.name);
    
    if (fs.existsSync(agentDir)) {
      if (identity) fs.writeFileSync(path.join(agentDir, 'IDENTITY.md'), identity);
      if (soul) fs.writeFileSync(path.join(agentDir, 'SOUL.md'), soul);
    }

    await contextManager.updateContext();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update agent' });
  }
});

// Sync agents from workspace/agents
router.post('/sync', async (req, res) => {
  try {
    const workspacePath = await getWorkspacePath();
    const agentsPath = path.join(workspacePath, 'agents');
    
    if (!fs.existsSync(agentsPath)) {
      return res.status(404).json({ error: 'Agents directory not found' });
    }

    const agentFolders = fs.readdirSync(agentsPath).filter(file => {
      return fs.statSync(path.join(agentsPath, file)).isDirectory();
    });

    const syncedAgents = [];

    for (const folder of agentFolders) {
      if (folder.startsWith('.')) continue; // skip hidden folders
      if (!isValidAgentName(folder)) continue; // skip potentially malicious folders
      
      const agentDir = path.join(agentsPath, folder);
      
      const identityPath = path.join(agentDir, 'IDENTITY.md');
      const soulPath = path.join(agentDir, 'SOUL.md');
      
      const identity = fs.existsSync(identityPath) ? fs.readFileSync(identityPath, 'utf8') : null;
      const soul = fs.existsSync(soulPath) ? fs.readFileSync(soulPath, 'utf8') : null;

      let role = folder;
      if (identity) {
        const roleMatch = identity.match(/Role:\s*(.*)/i);
        if (roleMatch && roleMatch[1]) {
          role = roleMatch[1].trim();
        }
      }

      const existingAgent = await prisma.agent.findUnique({
        where: { name: folder }
      });

      let agent;
      if (existingAgent) {
        agent = await prisma.agent.update({
          where: { id: existingAgent.id },
          data: { identity, soul, role }
        });
      } else {
        agent = await prisma.agent.create({
          data: {
            name: folder,
            role,
            identity,
            soul
          }
        });
      }
      syncedAgents.push(agent);
    }

    await contextManager.updateContext();
    res.json({ message: `Synced ${syncedAgents.length} agents`, agents: syncedAgents });
  } catch (error) {
    console.error('Error syncing agents:', error);
    res.status(500).json({ error: 'Failed to sync agents' });
  }
});

export default router;
