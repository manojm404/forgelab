import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { ContextManager } from '../engine/contextManager';

const router = Router();
const prisma = new PrismaClient();
const contextManager = new ContextManager(path.resolve(__dirname, '../../../workspace'));

// Helper to get workspace path from settings or fallback
async function getWorkspacePath() {
  const setting = await prisma.setting.findUnique({ where: { key: 'WORKSPACE_PATH' } });
  return setting?.value || path.resolve(__dirname, '../../../workspace');
}

// Utility: Prevent Path Traversal (Allow spaces, dashes, and underscores)
function isValidAgentName(name: string): boolean {
  // Only allow alphanumeric, spaces, dashes, and underscores. No slashes or dots that could lead to traversal.
  return /^[a-zA-Z0-9\s_-]+$/.test(name);
}

// Helper to read agent YAML files
function readAgentFiles(agentDir: string) {
  const agentYamlPath = path.join(agentDir, 'agent.yaml');
  const memoryYamlPath = path.join(agentDir, 'memory.yaml');

  let identity = '';
  let soul = '';
  let tools = '';

  if (fs.existsSync(agentYamlPath)) {
    const agentYaml: any = yaml.load(fs.readFileSync(agentYamlPath, 'utf8'));
    identity = agentYaml?.identity?.raw_markdown || '';
    tools = agentYaml?.tools?.raw_markdown || '';
  }

  if (fs.existsSync(memoryYamlPath)) {
    const memoryYaml: any = yaml.load(fs.readFileSync(memoryYamlPath, 'utf8'));
    soul = memoryYaml?.soul?.raw_markdown || '';
  }

  return { identity, soul, tools };
}

// Helper to write agent YAML files
function writeAgentFiles(agentDir: string, agentName: string, data: { identity?: string, soul?: string, tools?: string, role?: string }) {
  const agentYamlPath = path.join(agentDir, 'agent.yaml');
  const memoryYamlPath = path.join(agentDir, 'memory.yaml');

  // Update agent.yaml
  if (fs.existsSync(agentYamlPath)) {
    const agentYaml: any = yaml.load(fs.readFileSync(agentYamlPath, 'utf8'));
    if (data.identity) {
      if (!agentYaml.identity) agentYaml.identity = {};
      agentYaml.identity.raw_markdown = data.identity;
    }
    if (data.tools) {
      if (!agentYaml.tools) agentYaml.tools = {};
      agentYaml.tools.raw_markdown = data.tools;
    }
    fs.writeFileSync(agentYamlPath, yaml.dump(agentYaml));
  } else {
    // Create basic agent.yaml if it doesn't exist
    const newAgentYaml = {
      version: '1.0',
      agent_name: agentName.toLowerCase().replace(/\s+/g, '-'),
      created_at: new Date().toISOString(),
      identity: {
        name: agentName,
        raw_markdown: data.identity || `# IDENTITY.md - Who Am I?\n\n- **Name:** ${agentName}\n- **Role:** ${data.role || 'Agent'}`
      },
      tools: { raw_markdown: data.tools || '# TOOLS.md\n\n' },
      bootstrap: { raw_markdown: '# BOOTSTRAP.md\n\n' }
    };
    fs.writeFileSync(agentYamlPath, yaml.dump(newAgentYaml));
  }

  // Update memory.yaml
  if (fs.existsSync(memoryYamlPath)) {
    const memoryYaml: any = yaml.load(fs.readFileSync(memoryYamlPath, 'utf8'));
    if (data.soul) {
      if (!memoryYaml.soul) memoryYaml.soul = {};
      memoryYaml.soul.raw_markdown = data.soul;
    }
    memoryYaml.last_updated = new Date().toISOString();
    fs.writeFileSync(memoryYamlPath, yaml.dump(memoryYaml));
  } else {
    // Create basic memory.yaml if it doesn't exist
    const newMemoryYaml = {
      version: '1.0',
      last_updated: new Date().toISOString(),
      soul: {
        raw_markdown: data.soul || `# SOUL.md - Who You Are\n\nBe genuinely helpful.`
      },
      user: { raw_markdown: '# USER.md\n\n' }
    };
    fs.writeFileSync(memoryYamlPath, yaml.dump(newMemoryYaml));
  }
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
    const { name, role, identity, soul, tools, model } = req.body;

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
        tools: tools || `# TOOLS.md\n\n`,
        model: model || 'gemini-1.5-flash'
      }
    });

    // File System Create (Safe because name is validated)
    const workspacePath = await getWorkspacePath();
    const agentDir = path.join(workspacePath, 'agents', name);

    if (!fs.existsSync(agentDir)) {
      fs.mkdirSync(agentDir, { recursive: true });
    }

    writeAgentFiles(agentDir, name, { identity: agent.identity!, soul: agent.soul!, tools: agent.tools!, role });

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
    const { identity, soul, tools, role, model } = req.body;

    const agent = await prisma.agent.findUnique({ where: { id: req.params.id } });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    if (!isValidAgentName(agent.name)) {
      return res.status(400).json({ error: 'Stored agent name is invalid. Aborting file operations.' });
    }

    // DB Update
    const updated = await prisma.agent.update({
      where: { id: req.params.id },
      data: { identity, soul, tools, role, model }
    });

    // File System Update (Safe because name is validated)
    const workspacePath = await getWorkspacePath();
    const agentDir = path.join(workspacePath, 'agents', agent.name);

    if (fs.existsSync(agentDir)) {
      writeAgentFiles(agentDir, agent.name, { identity, soul, tools, role });
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
      const { identity, soul, tools } = readAgentFiles(agentDir);

      let name = folder;
      const yamlPath = path.join(agentDir, 'agent.yaml');
      if (fs.existsSync(yamlPath)) {
        const agentYaml: any = yaml.load(fs.readFileSync(yamlPath, 'utf8'));
        if (agentYaml?.agent_name) {
           name = agentYaml.agent_name.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }
      }

      const existingAgent = await prisma.agent.findFirst({
        where: { OR: [{ name: folder }, { name: name }] }
      });

      let agent;
      if (existingAgent) {
        agent = await prisma.agent.update({
          where: { id: existingAgent.id },
          data: { identity, soul, tools, name, role: name }
        });
      } else {
        agent = await prisma.agent.create({
          data: {
            name,
            role: name,
            identity,
            soul,
            tools
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

// Mock chat endpoint for demo/testing
router.post('/:id/chat', async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get agent info
    const agent = await prisma.agent.findUnique({
      where: { id }
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const agentName = agent.name.toLowerCase();
    const lowerMessage = message.toLowerCase();

    // Generate short & sweet mock responses based on agent type
    let mockResponse = '';

    // Greeting responses
    if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
      if (agentName.includes('architect')) {
        mockResponse = `👋 Hey! I'm ${agent.name}. I design scalable systems and make sure your architecture is rock-solid. What are we building today?`;
      } else if (agentName.includes('developer') || agentName.includes('engineer')) {
        mockResponse = `🚀 Hi there! ${agent.name} here. I write clean code and ship features fast. What needs building?`;
      } else if (agentName.includes('designer') || agentName.includes('artist')) {
        mockResponse = `✨ Hello! I'm ${agent.name}. I craft beautiful UIs and smooth experiences. What should we design?`;
      } else if (agentName.includes('manager') || agentName.includes('lead') || agentName.includes('project')) {
        mockResponse = `📋 Hey! ${agent.name} at your service. I keep projects on track and teams aligned. What's the goal?`;
      } else if (agentName.includes('security') || agentName.includes('audit')) {
        mockResponse = `🔒 Hi! I'm ${agent.name}. I protect your systems and find vulnerabilities before they bite. What needs securing?`;
      } else if (agentName.includes('data') || agentName.includes('analyst')) {
        mockResponse = `📊 Hello! ${agent.name} here. I turn raw data into actionable insights. What should we analyze?`;
      } else if (agentName.includes('marketing') || agentName.includes('seo') || agentName.includes('social')) {
        mockResponse = `📣 Hey there! I'm ${agent.name}. I grow audiences and boost engagement. What campaign are we running?`;
      } else if (agentName.includes('content') || agentName.includes('writer')) {
        mockResponse = `✍️ Hi! ${agent.name} here. I craft compelling copy and stories. What should we write today?`;
      } else if (agentName.includes('test') || agentName.includes('qa')) {
        mockResponse = `🧪 Hello! I'm ${agent.name}. I break things so production doesn't have to. What needs testing?`;
      } else if (agentName.includes('devops') || agentName.includes('sre')) {
        mockResponse = `⚙️ Hey! ${agent.name} here. I automate deployments and keep systems running. What needs scaling?`;
      } else {
        mockResponse = `👋 Hi! I'm ${agent.name}, your AI agent. I'm here to help with ${agent.role || 'anything you need'}. What's up?`;
      }
    }
    // Task-specific responses
    else if (lowerMessage.includes('help')) {
      mockResponse = `🤖 I'm ${agent.name}. I specialize in ${agent.role || 'my domain'}. Just tell me what you need done, and I'll handle it!`;
    }
    else if (lowerMessage.includes('what can you do') || lowerMessage.includes('what do you do')) {
      mockResponse = `💡 I'm ${agent.name}. My expertise: ${agent.role || 'autonomous task execution'}. I can analyze, plan, and execute tasks in my domain. Try giving me a specific task!`;
    }
    else if (lowerMessage.includes('status') || lowerMessage.includes('ready')) {
      mockResponse = `✅ ${agent.name} online and ready! Systems nominal. Awaiting your instructions.`;
    }
    // Default task response
    else {
      const tasks = [
        `Got it! I'm on it. 🔍`,
        `Understood. Let me analyze this... 🧠`,
        `Perfect. I'll handle this for you. ⚡`,
        `Copy that. Working on it now. 🚀`,
        `Thanks for the details! Let me process this. 💡`
      ];
      mockResponse = tasks[Math.floor(Math.random() * tasks.length)];
    }

    res.json({
      agentId: id,
      agentName: agent.name,
      userMessage: message,
      response: mockResponse,
      timestamp: new Date().toISOString(),
      isMock: true
    });
  } catch (error) {
    console.error('Mock chat error:', error);
    res.status(500).json({ error: 'Failed to generate mock response' });
  }
});

// Get agent stats for marketplace display
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    
    const agent = await prisma.agent.findUnique({
      where: { id },
      include: { 
        runs: {
          where: { status: 'completed' },
          orderBy: { startedAt: 'desc' },
          take: 20
        },
        tasks: {
          where: { status: 'completed' },
          orderBy: { completedAt: 'desc' },
          take: 20
        }
      }
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Calculate stats from real data
    const completedRuns = agent.runs.length;
    const totalRuns = await prisma.run.count({
      where: { agentId: id }
    });
    
    // Calculate average delivery time (from runs)
    let avgDeliveryTime = '24hr'; // Default placeholder
    if (agent.runs.length > 0) {
      const deliveryTimes = agent.runs
        .filter(run => run.endedAt && run.startedAt)
        .map(run => {
          const start = new Date(run.startedAt).getTime();
          const end = new Date(run.endedAt!).getTime();
          return (end - start) / (1000 * 60 * 60); // hours
        });
      
      if (deliveryTimes.length > 0) {
        const avgHours = deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length;
        if (avgHours < 1) {
          avgDeliveryTime = `${Math.round(avgHours * 60)}min`;
        } else if (avgHours < 24) {
          avgDeliveryTime = `${Math.round(avgHours)}hr`;
        } else {
          avgDeliveryTime = `${Math.round(avgHours / 24)}d`;
        }
      }
    }

    // Calculate success rate
    const successRate = totalRuns > 0 
      ? Math.round((completedRuns / totalRuns) * 100) 
      : agent.successRate || 0;

    // Placeholder stats for demo (until we have real ratings)
    const stats = {
      completedTasks: completedRuns || agent.totalTasks || 0,
      totalTasks: totalRuns || agent.totalTasks || 0,
      clientSatisfaction: 98, // Placeholder until ratings system
      avgDeliveryTime,
      responseTime: '3.5s', // Placeholder for mock mode
      successRate,
      rating: 4.9, // Placeholder until ratings system
      reviewCount: Math.max(completedRuns, agent.totalTasks || 0) // Use task count as review proxy
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching agent stats:', error);
    res.status(500).json({ error: 'Failed to fetch agent stats' });
  }
});

// Get agent profile for marketplace display
router.get('/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;
    
    const agent = await prisma.agent.findUnique({
      where: { id },
      include: {
        runs: {
          include: { task: true },
          orderBy: { startedAt: 'desc' },
          take: 6
        }
      }
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Get agent category
    const category = getAgentCategory(agent.name, agent.role);
    
    // Extract tagline from identity or generate from role
    let tagline = '';
    if (agent.identity) {
      const firstLine = agent.identity.split('\n').find(line => line.trim().length > 0);
      if (firstLine) {
        tagline = firstLine.replace(/^[-#*]+/, '').trim();
      }
    }
    if (!tagline) {
      tagline = generateTagline(category);
    }

    // Generate capabilities from category
    const capabilities = category.capabilities;

    // Generate portfolio from completed runs
    const portfolio = agent.runs
      .filter(run => run.status === 'completed' && run.task)
      .slice(0, 3)
      .map(run => ({
        id: run.id,
        title: run.task.title,
        type: category.name,
        rating: 5, // Placeholder
        description: run.task.description.slice(0, 100) + '...'
      }));

    // If no real portfolio, use placeholders
    if (portfolio.length === 0) {
      portfolio.push(...getPlaceholderPortfolio(category));
    }

    // Generate testimonials (placeholders for now)
    const testimonials = getPlaceholderTestimonials(category);

    // Generate quick-start templates
    const quickStartTemplates = category.templates;

    const profile = {
      id: agent.id,
      name: agent.name,
      role: agent.role,
      category: category.id,
      categoryName: category.name,
      emoji: category.emoji,
      tagline,
      capabilities,
      portfolio,
      testimonials,
      quickStartTemplates,
      model: agent.model,
      status: agent.status
    };

    res.json(profile);
  } catch (error) {
    console.error('Error fetching agent profile:', error);
    res.status(500).json({ error: 'Failed to fetch agent profile' });
  }
});

// Agent category mapping for 155+ agents
function getAgentCategory(name: string, role: string) {
  const lowerName = name.toLowerCase();
  const lowerRole = role.toLowerCase();
  const searchText = `${lowerName} ${lowerRole}`;

  // Engineering
  if (searchText.match(/architect|engineer|developer|dev|sre|infrastructure|backend|frontend|full.?stack|devops/)) {
    return {
      id: 'engineering',
      name: 'Engineering & Infrastructure',
      emoji: '🏗️',
      capabilities: [
        'System Architecture Design',
        'Code Review & Optimization',
        'API Design & Development',
        'Database Schema Design',
        'Microservices Architecture',
        'Cloud Infrastructure Setup',
        'CI/CD Pipeline Configuration',
        'Performance Optimization'
      ],
      templates: [
        'Design a microservices architecture for [your application]',
        'Review and optimize this code: [paste code]',
        'Create an API design for [feature]',
        'Set up a CI/CD pipeline for [project]',
        'Optimize database queries for [use case]'
      ]
    };
  }

  // Creative
  if (searchText.match(/designer|artist|creative|ui|ux|graphic|visual|motion/)) {
    return {
      id: 'creative',
      name: 'Creative & UI/UX Design',
      emoji: '🎨',
      capabilities: [
        'UI/UX Design',
        'Logo & Brand Identity',
        'Wireframing & Prototyping',
        'Visual Design Systems',
        'Icon & Illustration',
        'Motion Graphics',
        'Design Review & Feedback',
        'Accessibility Compliance'
      ],
      templates: [
        'Design a landing page for [product]',
        'Create a logo for [brand]',
        'Design a mobile app UI for [app purpose]',
        'Review and improve this design: [attach]',
        'Create a design system for [company]'
      ]
    };
  }

  // Strategy
  if (searchText.match(/manager|lead|project|strategist|director|consultant|advisor/)) {
    return {
      id: 'strategy',
      name: 'Strategy & Planning',
      emoji: '📋',
      capabilities: [
        'Project Planning & Execution',
        'Team Coordination',
        'Strategic Planning',
        'Risk Assessment',
        'Resource Allocation',
        'Stakeholder Management',
        'Process Optimization',
        'Goal Setting & OKRs'
      ],
      templates: [
        'Create a project plan for [initiative]',
        'Develop a strategy for [goal]',
        'Plan a product launch for [product]',
        'Optimize team workflow for [team]',
        'Create OKRs for [quarter/year]'
      ]
    };
  }

  // Marketing
  if (searchText.match(/marketing|seo|social|growth|content|brand|pr|communications/)) {
    return {
      id: 'marketing',
      name: 'Marketing & Growth',
      emoji: '📣',
      capabilities: [
        'Content Strategy',
        'SEO Optimization',
        'Social Media Management',
        'Email Marketing Campaigns',
        'Growth Hacking',
        'Brand Positioning',
        'Market Research',
        'Analytics & Reporting'
      ],
      templates: [
        'Create a content calendar for [month/quarter]',
        'Write SEO-optimized blog posts about [topic]',
        'Plan a social media campaign for [product]',
        'Design an email nurture sequence for [audience]',
        'Develop a growth strategy for [metric]'
      ]
    };
  }

  // Security
  if (searchText.match(/security|audit|compliance|risk|pentest|vulnerability/)) {
    return {
      id: 'security',
      name: 'Security & Compliance',
      emoji: '🔒',
      capabilities: [
        'Security Audits',
        'Vulnerability Assessment',
        'Compliance Review (GDPR, SOC2)',
        'Penetration Testing',
        'Security Policy Creation',
        'Risk Assessment',
        'Incident Response Planning',
        'Security Training'
      ],
      templates: [
        'Conduct a security audit for [system]',
        'Review compliance with [standard: GDPR/SOC2/HIPAA]',
        'Perform vulnerability assessment on [application]',
        'Create security policies for [organization]',
        'Develop an incident response plan'
      ]
    };
  }

  // Data
  if (searchText.match(/data|analyst|analytics|research|scientist|bi|insights/)) {
    return {
      id: 'data',
      name: 'Data & Analytics',
      emoji: '📊',
      capabilities: [
        'Data Analysis & Insights',
        'Dashboard Creation',
        'Statistical Analysis',
        'Data Visualization',
        'Predictive Modeling',
        'A/B Testing',
        'Market Research',
        'Competitive Analysis'
      ],
      templates: [
        'Analyze this dataset: [upload/describe]',
        'Create a dashboard for [metrics]',
        'Perform statistical analysis on [data]',
        'Design an A/B test for [feature]',
        'Research [topic] and provide insights'
      ]
    };
  }

  // Quality
  if (searchText.match(/qa|test|quality|reviewer|inspector/)) {
    return {
      id: 'quality',
      name: 'Quality & Testing',
      emoji: '🧪',
      capabilities: [
        'Test Plan Creation',
        'Automated Testing',
        'Manual QA Testing',
        'Performance Testing',
        'User Acceptance Testing',
        'Bug Triage & Prioritization',
        'Test Documentation',
        'Quality Metrics'
      ],
      templates: [
        'Create a test plan for [feature]',
        'Write automated tests for [module]',
        'Perform QA testing on [application]',
        'Document test cases for [feature]',
        'Set up performance testing for [system]'
      ]
    };
  }

  // Operations (default)
  return {
    id: 'operations',
    name: 'Specialized Operations',
    emoji: '⚙️',
    capabilities: [
      'Task Automation',
      'Process Documentation',
      'Workflow Optimization',
      'Tool Integration',
      'Knowledge Management',
      'Communication Coordination',
      'Research & Analysis',
      'Administrative Support'
    ],
    templates: [
      'Automate this workflow: [describe]',
      'Document this process: [describe]',
      'Optimize workflow for [team/task]',
      'Research [topic] and summarize findings',
      'Set up integrations for [tools]'
    ]
  };
}

function generateTagline(category: any): string {
  const taglines: Record<string, string> = {
    engineering: 'I build scalable systems and robust architectures that power your business.',
    creative: 'I craft beautiful, user-centered designs that delight and convert.',
    strategy: 'I turn complex challenges into clear, actionable plans for success.',
    marketing: 'I create compelling campaigns that grow your audience and drive results.',
    security: 'I protect your systems and data with enterprise-grade security practices.',
    data: 'I transform raw data into actionable insights that drive smart decisions.',
    quality: 'I ensure your products meet the highest standards through rigorous testing.',
    operations: 'I streamline your workflows and keep your operations running smoothly.'
  };
  return taglines[category.id] || 'I\'m here to help you achieve your goals efficiently.';
}

function getPlaceholderPortfolio(category: any) {
  const portfolios: Record<string, any[]> = {
    engineering: [
      { id: 'p1', title: 'Microservices Migration', type: 'Architecture', rating: 5, description: 'Led migration from monolith to microservices, improving scalability by 10x.' },
      { id: 'p2', title: 'API Gateway Implementation', type: 'Infrastructure', rating: 5, description: 'Designed and implemented API gateway handling 1M+ requests/day.' },
      { id: 'p3', title: 'Database Optimization', type: 'Performance', rating: 4, description: 'Reduced query times by 80% through indexing and query optimization.' }
    ],
    creative: [
      { id: 'p1', title: 'SaaS Dashboard Redesign', type: 'UI Design', rating: 5, description: 'Complete dashboard overhaul improving user engagement by 40%.' },
      { id: 'p2', title: 'Brand Identity System', type: 'Branding', rating: 5, description: 'Created comprehensive brand guidelines for tech startup.' },
      { id: 'p3', title: 'Mobile App UI Kit', type: 'Mobile Design', rating: 5, description: 'Designed 50+ screens for iOS/Android fitness app.' }
    ],
    strategy: [
      { id: 'p1', title: 'Product Launch Strategy', type: 'Planning', rating: 5, description: 'Orchestrated successful launch reaching 10K users in week 1.' },
      { id: 'p2', title: 'Team Restructuring Plan', type: 'Organization', rating: 4, description: 'Restructured 20-person team improving velocity by 35%.' },
      { id: 'p3', title: 'Market Entry Strategy', type: 'Strategy', rating: 5, description: 'Developed go-to-market strategy for European expansion.' }
    ],
    marketing: [
      { id: 'p1', title: 'Content Marketing Campaign', type: 'Content', rating: 5, description: 'Generated 50K organic visitors through SEO content strategy.' },
      { id: 'p2', title: 'Social Media Growth', type: 'Social', rating: 5, description: 'Grew LinkedIn following from 1K to 25K in 6 months.' },
      { id: 'p3', title: 'Email Nurture Sequence', type: 'Email', rating: 4, description: 'Created email sequence with 45% open rate and 12% CTR.' }
    ],
    security: [
      { id: 'p1', title: 'SOC2 Compliance Audit', type: 'Compliance', rating: 5, description: 'Led company through successful SOC2 Type II certification.' },
      { id: 'p2', title: 'Penetration Testing', type: 'Security', rating: 5, description: 'Identified and remediated 50+ vulnerabilities in web application.' },
      { id: 'p3', title: 'Security Training Program', type: 'Training', rating: 5, description: 'Developed security awareness training for 200+ employees.' }
    ],
    data: [
      { id: 'p1', title: 'Customer Analytics Dashboard', type: 'Analytics', rating: 5, description: 'Built real-time dashboard tracking 100+ KPIs for executives.' },
      { id: 'p2', title: 'Churn Prediction Model', type: 'ML', rating: 5, description: 'Created ML model predicting churn with 85% accuracy.' },
      { id: 'p3', title: 'Market Research Analysis', type: 'Research', rating: 4, description: 'Analyzed competitor landscape for $50M market opportunity.' }
    ],
    quality: [
      { id: 'p1', title: 'Test Automation Framework', type: 'Automation', rating: 5, description: 'Built automation framework reducing regression time by 70%.' },
      { id: 'p2', title: 'Performance Testing Suite', type: 'Performance', rating: 5, description: 'Implemented load testing identifying bottlenecks at 10K concurrent users.' },
      { id: 'p3', title: 'QA Process Overhaul', type: 'Process', rating: 4, description: 'Redesigned QA process reducing production bugs by 60%.' }
    ],
    operations: [
      { id: 'p1', title: 'Workflow Automation System', type: 'Automation', rating: 5, description: 'Automated 20+ manual processes saving 15 hours/week.' },
      { id: 'p2', title: 'Knowledge Base Creation', type: 'Documentation', rating: 5, description: 'Built comprehensive knowledge base with 500+ articles.' },
      { id: 'p3', title: 'Tool Integration Project', type: 'Integration', rating: 4, description: 'Integrated 10+ tools streamlining team communication.' }
    ]
  };
  return portfolios[category.id] || portfolios.operations;
}

function getPlaceholderTestimonials(category: any) {
  const testimonials: Record<string, any[]> = {
    engineering: [
      { id: 't1', quote: 'Delivered a rock-solid architecture that scaled seamlessly. Best engineer we\'ve worked with!', name: 'Sarah Chen', role: 'CTO, TechStart' },
      { id: 't2', quote: 'Incredible attention to detail. Caught issues we didn\'t even know we had.', name: 'Mike Rodriguez', role: 'Engineering Lead, ScaleUp' }
    ],
    creative: [
      { id: 't1', quote: 'The designs exceeded our expectations. Our conversion rate doubled after the redesign!', name: 'Emily Watson', role: 'Product Manager, DesignCo' },
      { id: 't2', quote: 'Beautiful, thoughtful work. Really understands user psychology.', name: 'James Park', role: 'Founder, CreativeLabs' }
    ],
    strategy: [
      { id: 't1', quote: 'Turned our chaotic roadmap into a clear, executable plan. Game changer!', name: 'David Kim', role: 'CEO, GrowthVentures' },
      { id: 't2', quote: 'Strategic insights were invaluable. Helped us avoid costly mistakes.', name: 'Lisa Thompson', role: 'VP Operations, Enterprise Inc' }
    ],
    marketing: [
      { id: 't1', quote: 'Our organic traffic tripled in 3 months. SEO expertise is unmatched!', name: 'Rachel Green', role: 'Marketing Director, ContentFirst' },
      { id: 't2', quote: 'Social media campaign was a home run. Best ROI we\'ve seen.', name: 'Tom Anderson', role: 'Founder, BrandBoost' }
    ],
    security: [
      { id: 't1', quote: 'Thorough security audit gave us peace of mind and investor confidence.', name: 'Alex Morgan', role: 'CTO, SecureTech' },
      { id: 't2', quote: 'Found critical vulnerabilities before attackers could. Invaluable!', name: 'Chris Lee', role: 'Security Lead, DataSafe' }
    ],
    data: [
      { id: 't1', quote: 'Insights from the analysis directly informed our $2M product decision.', name: 'Jennifer Wu', role: 'VP Product, DataDriven' },
      { id: 't2', quote: 'Dashboard transformed how we make decisions. Clear, actionable, beautiful.', name: 'Robert Taylor', role: 'CEO, MetricsMatter' }
    ],
    quality: [
      { id: 't1', quote: 'Bug detection rate improved 3x. Our release confidence has never been higher.', name: 'Michelle Brown', role: 'Engineering Manager, QualityFirst' },
      { id: 't2', quote: 'Test automation saved us hundreds of hours. Worth every penny.', name: 'Kevin Zhang', role: 'QA Lead, TestPro' }
    ],
    operations: [
      { id: 't1', quote: 'Streamlined our entire workflow. We\'re 40% more efficient now.', name: 'Amanda Foster', role: 'COO, EfficientCo' },
      { id: 't2', quote: 'Documentation was comprehensive and actually useful. Rare find!', name: 'Brian Miller', role: 'Operations Director, ProcessPro' }
    ]
  };
  return testimonials[category.id] || testimonials.operations;
}

export default router;

