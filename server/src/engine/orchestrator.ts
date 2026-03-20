import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';
import { TaskRunner } from './runner';

const prisma = new PrismaClient();

export class TeamOrchestrator {
  private io: Server;
  private runner: TaskRunner;

  constructor(io: Server, runner: TaskRunner) {
    this.io = io;
    this.runner = runner;
  }

  async orchestrateTeam(teamId: string) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: { include: { agent: true } }, tasks: true }
    });

    if (!team) throw new Error('Team not found');

    const lead = team.members.find(m => m.role === 'lead');
    if (!lead) throw new Error('Team lead not found');

    // 1. Initialize the Team Lead agent
    console.log(`[orchestrator] Initializing team lead: ${lead.agent.name}`);
    
    // 2. The Team Lead will be responsible for creating the initial plan
    // and spawning sub-tasks.
    // For now, we trigger the lead's run with the high-level team task.
    await this.runner.runTask(teamId); 
  }
}
