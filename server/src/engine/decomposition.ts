import { PrismaClient } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';

const prisma = new PrismaClient();

export class TaskDecompositionService {
  private genAI: GoogleGenAI;

  constructor() {
    this.genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  }

  async decomposeTask(taskId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { team: { include: { members: { include: { agent: true } } } } }
    });

    if (!task || !task.team) throw new Error('Task or Team not found');

    const members = task.team.members.map(m => `${m.agent.name} (${m.role})`).join(', ');

    const prompt = `
      You are the Team Lead. Decompose the following project task into smaller, actionable sub-tasks for your team.
      
      Project: ${task.title}
      Goal: ${task.description}
      Team Members: ${members}
      
      Return a JSON array of objects with: { title: string, description: string, agentId: string }.
      Ensure agentId matches one of the team members above.
    `;

    const response = await this.genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const subTasks = JSON.parse(response.text);

    for (const st of subTasks) {
      await prisma.task.create({
        data: {
          title: st.title,
          description: st.description,
          agentId: st.agentId,
          teamId: task.teamId,
          parentTaskId: taskId,
          status: 'pending'
        }
      });
    }

    return subTasks;
  }
}
