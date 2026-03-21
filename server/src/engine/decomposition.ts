import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();

export class TaskDecompositionService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }

  async decomposeTask(taskId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { team: { include: { members: { include: { agent: true } } } } }
    });

    if (!task || !task.team) throw new Error('Task or Team not found');

    const isMockMode = !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock';

    if (isMockMode) {
      console.log(`[decomposition:mock] Simulating decomposition for task: ${task.title}`);
      
      const members = task.team.members;
      const subTasks = [
        {
          title: "Phase 1: Architecture Blueprint",
          description: "Analyze the project requirements and define the core logic structures.",
          agentId: members.find(m => m.role === 'lead')?.agentId || members[0].agentId
        },
        {
          title: "Phase 2: Component Implementation",
          description: "Develop the primary functional modules based on the architecture plan.",
          agentId: members.find(m => m.role !== 'lead')?.agentId || members[0].agentId
        },
        {
          title: "Phase 3: Integration & Validation",
          description: "Connect the modules and verify the neural handshake between agents.",
          agentId: members[0].agentId
        }
      ];

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

    const membersList = task.team.members.map(m => `${m.agent.name} (${m.role})`).join(', ');

    const prompt = `
      You are the Team Lead. Decompose the following project task into smaller, actionable sub-tasks for your team.

      Project: ${task.title}
      Goal: ${task.description}
      Team Members: ${members}

      IMPORTANT: Return ONLY a raw JSON array of objects with: { "title": "string", "description": "string", "agentId": "string" }.
      Ensure agentId matches one of the team members above.
    `;

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    }, { apiVersion: 'v1' });

    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      });

      const response = await result.response;
      const responseText = response.text();

      if (!responseText) {
        throw new Error('Model returned an empty response.');
      }

      const subTasks = JSON.parse(responseText);

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
    } catch (error: any) {
      console.error('[decomposition] API Error:', error.message);
      throw error;
    }
  }
}
