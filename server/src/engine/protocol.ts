import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AgentCommunicationProtocol {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  async broadcastMessage(senderId: string, teamId: string, message: string, type: 'task-update' | 'review-request' | 'handoff') {
    // 1. Persist the message in the database (linked to a team or task)
    const log = await prisma.transcript.create({
      data: {
        runId: senderId, // Using senderId as a reference to the agent's current run
        type: 'assistant',
        content: `[Agent Message][${type}]: ${message}`
      }
    });

    // 2. Broadcast via WebSockets to all team members
    this.io.to(`team:${teamId}`).emit('agent:message', {
      senderId,
      teamId,
      message,
      type,
      timestamp: log.timestamp
    });
  }
}
