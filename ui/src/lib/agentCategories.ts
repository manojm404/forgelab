// Agent Category Configuration for 155+ Agents
// This file provides consistent categorization, capabilities, and templates across all agents

export interface AgentCategory {
  id: string;
  name: string;
  emoji: string;
  capabilities: string[];
  templates: string[];
  tagline: string;
  portfolio: PortfolioItem[];
  testimonials: Testimonial[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  type: string;
  rating: number;
  description: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
}

// Category definitions
export const agentCategories: Record<string, AgentCategory> = {
  engineering: {
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
    ],
    tagline: 'I build scalable systems and robust architectures that power your business.',
    portfolio: [
      { id: 'p1', title: 'Microservices Migration', type: 'Architecture', rating: 5, description: 'Led migration from monolith to microservices, improving scalability by 10x.' },
      { id: 'p2', title: 'API Gateway Implementation', type: 'Infrastructure', rating: 5, description: 'Designed and implemented API gateway handling 1M+ requests/day.' },
      { id: 'p3', title: 'Database Optimization', type: 'Performance', rating: 4, description: 'Reduced query times by 80% through indexing and query optimization.' }
    ],
    testimonials: [
      { id: 't1', quote: 'Delivered a rock-solid architecture that scaled seamlessly. Best engineer we\'ve worked with!', name: 'Sarah Chen', role: 'CTO, TechStart' },
      { id: 't2', quote: 'Incredible attention to detail. Caught issues we didn\'t even know we had.', name: 'Mike Rodriguez', role: 'Engineering Lead, ScaleUp' }
    ]
  },

  creative: {
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
    ],
    tagline: 'I craft beautiful, user-centered designs that delight and convert.',
    portfolio: [
      { id: 'p1', title: 'SaaS Dashboard Redesign', type: 'UI Design', rating: 5, description: 'Complete dashboard overhaul improving user engagement by 40%.' },
      { id: 'p2', title: 'Brand Identity System', type: 'Branding', rating: 5, description: 'Created comprehensive brand guidelines for tech startup.' },
      { id: 'p3', title: 'Mobile App UI Kit', type: 'Mobile Design', rating: 5, description: 'Designed 50+ screens for iOS/Android fitness app.' }
    ],
    testimonials: [
      { id: 't1', quote: 'The designs exceeded our expectations. Our conversion rate doubled after the redesign!', name: 'Emily Watson', role: 'Product Manager, DesignCo' },
      { id: 't2', quote: 'Beautiful, thoughtful work. Really understands user psychology.', name: 'James Park', role: 'Founder, CreativeLabs' }
    ]
  },

  strategy: {
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
    ],
    tagline: 'I turn complex challenges into clear, actionable plans for success.',
    portfolio: [
      { id: 'p1', title: 'Product Launch Strategy', type: 'Planning', rating: 5, description: 'Orchestrated successful launch reaching 10K users in week 1.' },
      { id: 'p2', title: 'Team Restructuring Plan', type: 'Organization', rating: 4, description: 'Restructured 20-person team improving velocity by 35%.' },
      { id: 'p3', title: 'Market Entry Strategy', type: 'Strategy', rating: 5, description: 'Developed go-to-market strategy for European expansion.' }
    ],
    testimonials: [
      { id: 't1', quote: 'Turned our chaotic roadmap into a clear, executable plan. Game changer!', name: 'David Kim', role: 'CEO, GrowthVentures' },
      { id: 't2', quote: 'Strategic insights were invaluable. Helped us avoid costly mistakes.', name: 'Lisa Thompson', role: 'VP Operations, Enterprise Inc' }
    ]
  },

  marketing: {
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
    ],
    tagline: 'I create compelling campaigns that grow your audience and drive results.',
    portfolio: [
      { id: 'p1', title: 'Content Marketing Campaign', type: 'Content', rating: 5, description: 'Generated 50K organic visitors through SEO content strategy.' },
      { id: 'p2', title: 'Social Media Growth', type: 'Social', rating: 5, description: 'Grew LinkedIn following from 1K to 25K in 6 months.' },
      { id: 'p3', title: 'Email Nurture Sequence', type: 'Email', rating: 4, description: 'Created email sequence with 45% open rate and 12% CTR.' }
    ],
    testimonials: [
      { id: 't1', quote: 'Our organic traffic tripled in 3 months. SEO expertise is unmatched!', name: 'Rachel Green', role: 'Marketing Director, ContentFirst' },
      { id: 't2', quote: 'Social media campaign was a home run. Best ROI we\'ve seen.', name: 'Tom Anderson', role: 'Founder, BrandBoost' }
    ]
  },

  security: {
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
    ],
    tagline: 'I protect your systems and data with enterprise-grade security practices.',
    portfolio: [
      { id: 'p1', title: 'SOC2 Compliance Audit', type: 'Compliance', rating: 5, description: 'Led company through successful SOC2 Type II certification.' },
      { id: 'p2', title: 'Penetration Testing', type: 'Security', rating: 5, description: 'Identified and remediated 50+ vulnerabilities in web application.' },
      { id: 'p3', title: 'Security Training Program', type: 'Training', rating: 5, description: 'Developed security awareness training for 200+ employees.' }
    ],
    testimonials: [
      { id: 't1', quote: 'Thorough security audit gave us peace of mind and investor confidence.', name: 'Alex Morgan', role: 'CTO, SecureTech' },
      { id: 't2', quote: 'Found critical vulnerabilities before attackers could. Invaluable!', name: 'Chris Lee', role: 'Security Lead, DataSafe' }
    ]
  },

  data: {
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
    ],
    tagline: 'I transform raw data into actionable insights that drive smart decisions.',
    portfolio: [
      { id: 'p1', title: 'Customer Analytics Dashboard', type: 'Analytics', rating: 5, description: 'Built real-time dashboard tracking 100+ KPIs for executives.' },
      { id: 'p2', title: 'Churn Prediction Model', type: 'ML', rating: 5, description: 'Created ML model predicting churn with 85% accuracy.' },
      { id: 'p3', title: 'Market Research Analysis', type: 'Research', rating: 4, description: 'Analyzed competitor landscape for $50M market opportunity.' }
    ],
    testimonials: [
      { id: 't1', quote: 'Insights from the analysis directly informed our $2M product decision.', name: 'Jennifer Wu', role: 'VP Product, DataDriven' },
      { id: 't2', quote: 'Dashboard transformed how we make decisions. Clear, actionable, beautiful.', name: 'Robert Taylor', role: 'CEO, MetricsMatter' }
    ]
  },

  quality: {
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
    ],
    tagline: 'I ensure your products meet the highest standards through rigorous testing.',
    portfolio: [
      { id: 'p1', title: 'Test Automation Framework', type: 'Automation', rating: 5, description: 'Built automation framework reducing regression time by 70%.' },
      { id: 'p2', title: 'Performance Testing Suite', type: 'Performance', rating: 5, description: 'Implemented load testing identifying bottlenecks at 10K concurrent users.' },
      { id: 'p3', title: 'QA Process Overhaul', type: 'Process', rating: 4, description: 'Redesigned QA process reducing production bugs by 60%.' }
    ],
    testimonials: [
      { id: 't1', quote: 'Bug detection rate improved 3x. Our release confidence has never been higher.', name: 'Michelle Brown', role: 'Engineering Manager, QualityFirst' },
      { id: 't2', quote: 'Test automation saved us hundreds of hours. Worth every penny.', name: 'Kevin Zhang', role: 'QA Lead, TestPro' }
    ]
  },

  operations: {
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
    ],
    tagline: 'I streamline your workflows and keep your operations running smoothly.',
    portfolio: [
      { id: 'p1', title: 'Workflow Automation System', type: 'Automation', rating: 5, description: 'Automated 20+ manual processes saving 15 hours/week.' },
      { id: 'p2', title: 'Knowledge Base Creation', type: 'Documentation', rating: 5, description: 'Built comprehensive knowledge base with 500+ articles.' },
      { id: 'p3', title: 'Tool Integration Project', type: 'Integration', rating: 4, description: 'Integrated 10+ tools streamlining team communication.' }
    ],
    testimonials: [
      { id: 't1', quote: 'Streamlined our entire workflow. We\'re 40% more efficient now.', name: 'Amanda Foster', role: 'COO, EfficientCo' },
      { id: 't2', quote: 'Documentation was comprehensive and actually useful. Rare find!', name: 'Brian Miller', role: 'Operations Director, ProcessPro' }
    ]
  }
};

// Helper function to determine agent category from name/role
export function getAgentCategory(agentName: string, agentRole: string): AgentCategory {
  const searchText = `${agentName} ${agentRole}`.toLowerCase();

  if (searchText.match(/architect|engineer|developer|dev|sre|infrastructure|backend|frontend|full.?stack|devops/)) {
    return agentCategories.engineering;
  }
  if (searchText.match(/designer|artist|creative|ui|ux|graphic|visual|motion/)) {
    return agentCategories.creative;
  }
  if (searchText.match(/manager|lead|project|strategist|director|consultant|advisor/)) {
    return agentCategories.strategy;
  }
  if (searchText.match(/marketing|seo|social|growth|content|brand|pr|communications/)) {
    return agentCategories.marketing;
  }
  if (searchText.match(/security|audit|compliance|risk|pentest|vulnerability/)) {
    return agentCategories.security;
  }
  if (searchText.match(/data|analyst|analytics|research|scientist|bi|insights/)) {
    return agentCategories.data;
  }
  if (searchText.match(/qa|test|quality|reviewer|inspector/)) {
    return agentCategories.quality;
  }

  return agentCategories.operations;
}

// Helper to get status indicator
export function getStatusIndicator(status: string) {
  switch (status) {
    case 'idle':
      return { emoji: '🟢', text: 'Online & Available' };
    case 'working':
    case 'running':
      return { emoji: '🟡', text: 'Working on Task' };
    case 'paused':
      return { emoji: '⏸️', text: 'Paused' };
    case 'error':
      return { emoji: '🔴', text: 'Offline' };
    default:
      return { emoji: '🟢', text: 'Available' };
  }
}
