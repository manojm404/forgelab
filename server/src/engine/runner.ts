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

    // Validate agent name to prevent injection
    if (!/^[a-zA-Z0-9_-]+$/.test(run.agent.name)) {
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
      let content = data.toString();
      
      // Redact sensitive keys before saving or broadcasting
      content = redactSensitiveInfo(content, [geminiApiKey]);

      // Save to database
      const transcript = await prisma.transcript.create({
        data: {
          runId,
          type,
          content
        }
      });

      // Stream to UI via WebSockets
      this.io.emit('transcript', transcript);
    };

    child.stdout.on('data', (data) => handleOutput(data, 'stdout'));
    child.stderr.on('data', (data) => handleOutput(data, 'stderr'));

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
}
