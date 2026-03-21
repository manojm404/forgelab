import { spawn } from 'child_process';
import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// Utility to redact sensitive information from logs
function redactSensitiveInfo(content: string, sensitiveKeys: string[]): string {
  let redactedContent = content;
  for (const key of sensitiveKeys) {
    if (key && key.length > 5) {
      // Replace all occurrences of the key with a masked version
      const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      redactedContent = redactedContent.replace(regex, '[REDACTED_API_KEY]');
    }
  }
  return redactedContent;
}

// Mock responses for different agent types
function getMockResponse(agentName: string, taskDescription: string): string {
  const lowerName = agentName.toLowerCase();
  const lowerTask = taskDescription.toLowerCase();
  
  // Greeting responses
  if (lowerTask.includes('hi') || lowerTask.includes('hello') || lowerTask.includes('hey')) {
    if (lowerName.includes('architect')) {
      return `👋 Hey! I'm ${agentName}. I design scalable systems and make sure your architecture is rock-solid. What are we building today?`;
    } else if (lowerName.includes('developer') || lowerName.includes('engineer')) {
      return `🚀 Hi there! ${agentName} here. I write clean code and ship features fast. What needs building?`;
    } else if (lowerName.includes('designer') || lowerName.includes('artist')) {
      return `✨ Hello! I'm ${agentName}. I craft beautiful UIs and smooth experiences. What should we design?`;
    } else if (lowerName.includes('manager') || lowerName.includes('lead') || lowerName.includes('project')) {
      return `📋 Hey! ${agentName} at your service. I keep projects on track and teams aligned. What's the goal?`;
    } else if (lowerName.includes('security') || lowerName.includes('audit')) {
      return `🔒 Hi! I'm ${agentName}. I protect your systems and find vulnerabilities before they bite. What needs securing?`;
    } else if (lowerName.includes('data') || lowerName.includes('analyst')) {
      return `📊 Hello! ${agentName} here. I turn raw data into actionable insights. What should we analyze?`;
    } else if (lowerName.includes('marketing') || lowerName.includes('seo') || lowerName.includes('social')) {
      return `📣 Hey there! I'm ${agentName}. I grow audiences and boost engagement. What campaign are we running?`;
    } else if (lowerName.includes('content') || lowerName.includes('writer')) {
      return `✍️ Hi! ${agentName} here. I craft compelling copy and stories. What should we write today?`;
    } else if (lowerName.includes('test') || lowerName.includes('qa')) {
      return `🧪 Hello! I'm ${agentName}. I break things so production doesn't have to. What needs testing?`;
    } else if (lowerName.includes('devops') || lowerName.includes('sre')) {
      return `⚙️ Hey! ${agentName} here. I automate deployments and keep systems running. What needs scaling?`;
    } else {
      return `👋 Hi! I'm ${agentName}, your AI agent. Ready to help! What's up?`;
    }
  }
  
  // Default task response
  const responses = [
    `Got it! I'm on it. 🔍`,
    `Understood. Let me analyze this... 🧠`,
    `Perfect. I'll handle this for you. ⚡`,
    `Copy that. Working on it now. 🚀`,
    `Thanks for the details! Let me process this. 💡`
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

export class TaskRunner {
  private io: Server;
  private forgePath: string;

  constructor(io: Server) {
    this.io = io;
    // Assuming server is running in forgelab/server
    this.forgePath = path.resolve(__dirname, '../../../forge');
  }

  async runTask(runId: string) {
    const run = await prisma.run.findUnique({
      where: { id: runId },
      include: { task: true, agent: true }
    });

    if (!run) throw new Error('Run not found');

    const workspaceSetting = await prisma.setting.findUnique({ where: { key: 'WORKSPACE_PATH' } });
    const workspacePath = workspaceSetting?.value || path.resolve(__dirname, '../../../workspace');

    const apiKeySetting = await prisma.setting.findUnique({ where: { key: 'GEMINI_API_KEY' } });
    const geminiApiKey = apiKeySetting?.value || process.env.GEMINI_API_KEY || '';

    // Check if running in mock mode
    const isMockMode = !geminiApiKey || geminiApiKey === 'mock' || process.env.FORGELAB_MOCK === 'true';

    // Validate agent name to prevent injection (Allow spaces, dashes, and underscores)
    if (!/^[a-zA-Z0-9\s_-]+$/.test(run.agent.name)) {
      throw new Error('Invalid agent name. Aborting execution to prevent injection.');
    }

    await prisma.run.update({
      where: { id: runId },
      data: { status: 'running', startedAt: new Date() }
    });

    await prisma.task.update({
      where: { id: run.taskId },
      data: { status: 'in-progress' }
    });

    this.io.emit('run:status', { runId, status: 'running' });

    // Handle Mock Mode - Return quick agent intro
    if (isMockMode) {
      await this.runMockTask(runId, run.agent.name, run.task.description);
      return;
    }

    // Ensure forge is executable
    if (fs.existsSync(this.forgePath)) {
        fs.chmodSync(this.forgePath, '755');
    }

    // Check for approval gate
    if (run.task.status === 'waiting-for-approval') {
      this.io.emit('human:approval_required', { taskId: run.task.id });
      console.log(`[forgelab] Task ${run.task.id} paused for approval.`);
      return; // Pause execution
    }

    // Spawn the ForgeLab CLI securely
    const args = [
      '--workspace', workspacePath,
      '--agent', run.agent.name,
      '--task', run.task.description
    ];

    const child = spawn(this.forgePath, args, {
      cwd: path.resolve(__dirname, '../../..'),
      env: {
        ...process.env,
        FORGELAB_WORKSPACE: workspacePath,
        GEMINI_API_KEY: geminiApiKey // Pass securely via env, not args
      }
    });

    const handleOutput = async (data: Buffer, type: 'stdout' | 'stderr' | 'system') => {
      const content = data.toString();

      // Intercept Tool Calls from CLI
      if (type === 'stdout' && content.includes('[FORGELAB_TOOL_CALL]')) {
        const lines = content.split('\n');
        for (const line of lines) {
          if (line.includes('[FORGELAB_TOOL_CALL]')) {
            try {
              const jsonStr = line.split('[FORGELAB_TOOL_CALL]')[1].trim();
              const toolCall = JSON.parse(jsonStr);
              await this.executeToolCall(runId, toolCall);
            } catch (e: any) {
              console.error('[runner] Tool Parse Error:', e.message);
            }
          }
        }
      }

      // Redact sensitive keys before saving or broadcasting
      const redactedContent = redactSensitiveInfo(content, [geminiApiKey]);

      // Save to database
      const transcript = await prisma.transcript.create({
        data: {
          runId,
          type,
          content: redactedContent
        }
      });

      // Stream to UI via WebSockets
      this.io.emit('transcript', transcript);
    };

    child.stdout.on('data', (data) => handleOutput(data, 'stdout'));
    child.stderr.on('data', (data) => handleOutput(data, 'stderr'));

    child.on('error', async (err) => {
      console.error(`[runner] Failed to spawn forge:`, err);
      await handleOutput(Buffer.from(`[System Error] Failed to start agent process: ${err.message}`), 'stderr');
      this.io.emit('run:status', { runId, status: 'failed' });
    });

    child.on('close', async (code) => {
      const status = code === 0 ? 'completed' : 'failed';

      await prisma.run.update({
        where: { id: runId },
        data: { status, endedAt: new Date() }
      });

      await prisma.task.update({
        where: { id: run.taskId },
        data: { status: code === 0 ? 'completed' : 'failed' }
      });

      // Let UI know the run finished
      this.io.emit('run:status', { runId, status });

      await handleOutput(Buffer.from(`[System] Process exited with code ${code}`), 'system');
    });
  }

  private async runMockTask(runId: string, agentName: string, taskDescription: string) {
    const handleOutput = async (content: string, type: 'stdout' | 'stderr' | 'system') => {
      const transcript = await prisma.transcript.create({
        data: {
          runId,
          type,
          content
        }
      });
      this.io.emit('transcript', transcript);
    };

    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Send agent response
    const mockResponse = getMockResponse(agentName, taskDescription);
    await handleOutput(`## ${agentName} says:\n${mockResponse}`, 'stdout');

    // Get the task to update it
    const mockRun = await prisma.run.findUnique({
      where: { id: runId },
      include: { task: true }
    });

    // Complete the task
    await prisma.run.update({
      where: { id: runId },
      data: { status: 'completed', endedAt: new Date() }
    });

    if (mockRun?.task) {
      await prisma.task.update({
        where: { id: mockRun.task.id },
        data: { status: 'completed' }
      });
    }

    this.io.emit('run:status', { runId, status: 'completed' });
    await handleOutput('[System] Mock execution completed', 'system');
  }

  private async executeToolCall(runId: string, call: any) {
    const run = await prisma.run.findUnique({
      where: { id: runId },
      include: { task: true, agent: true }
    });
    if (!run) return;

    console.log(`[runner] Neural Tool Call: ${call.name} from agent ${run.agent.name}`);

    switch (call.name) {
      case 'post_to_blackboard':
        if (run.task.teamId) {
          const { content, type } = call.args;
          const newMessage = {
            id: Date.now().toString(),
            agentId: run.agentId,
            agentName: run.agent.name,
            content,
            type: type || 'proposal',
            timestamp: new Date().toISOString()
          };

          this.io.emit('blackboard:message', newMessage);
          
          const blackboard = await prisma.blackboard.findUnique({ where: { teamId: run.task.teamId } });
          if (blackboard) {
            const messages = JSON.parse(blackboard.messages || '[]');
            messages.push(newMessage);
            await prisma.blackboard.update({
              where: { teamId: run.task.teamId },
              data: { messages: JSON.stringify(messages.slice(-50)), updatedAt: new Date() }
            });
          }
        }
        break;

      case 'create_subtask':
        const { title, description, agentIdOrRole } = call.args;
        
        // Find matching agent in team or global
        const targetAgent = await prisma.agent.findFirst({
          where: { 
            OR: [
              { name: { contains: agentIdOrRole } },
              { role: { contains: agentIdOrRole } }
            ]
          }
        });

        if (targetAgent) {
          await prisma.task.create({
            data: {
              title,
              description,
              agentId: targetAgent.id,
              teamId: run.task.teamId,
              parentTaskId: run.taskId,
              status: 'pending',
              priority: 'medium',
              createdBy: 'agent'
            }
          });
          this.io.emit('task:update', { message: `Autonomous task created: ${title}` });
        }
        break;

      case 'request_human_approval':
        const { reason } = call.args;
        await prisma.task.update({
          where: { id: run.taskId },
          data: { status: 'waiting-for-approval' }
        });
        this.io.emit('human:approval_required', { 
          taskId: run.taskId, 
          agentName: run.agent.name,
          reason 
        });
        break;
    }
  }
}
