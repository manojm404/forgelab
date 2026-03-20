# ForgeLab × Paperclip Integration Guide

This guide explains how to integrate ForgeLab agents with Paperclip for company orchestration.

## Overview

- **ForgeLab**: Provides AI agents with memory, identity, and tool capabilities
- **Paperclip**: Orchestrates multiple agents as a company with budgets, goals, and governance
- **Integration**: ForgeLab agents become workers in your Paperclip company

## Architecture

```
┌─────────────────────────────────────┐
│         Paperclip Company           │
│  ┌─────────────────────────────┐    │
│  │   ForgeLab Agent Worker     │    │
│  │   (via forgelab_local)      │    │
│  │                             │    │
│  │  ┌───────────────────────┐  │    │
│  │  │  forge CLI Entry Point│  │    │
│  │  └───────────┬───────────┘  │    │
│  │              │               │    │
│  │  ┌───────────▼───────────┐  │    │
│  │  │  Gemini API (LLM)     │  │    │
│  │  └───────────────────────┘  │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

## Prerequisites

1. **ForgeLab workspace** with agent definitions
2. **Paperclip instance** (local or deployed)
3. **Gemini API key** from Google AI Studio

## Setup Steps

### 1. Configure Gemini API Key

Your Gemini API key must be accessible when Paperclip calls ForgeLab agents.

**Option A: Store in ForgeLab .env (Recommended for local development)**

```bash
# /path/to/forgelab/.env
GEMINI_API_KEY=[YOUR_API_KEY_HERE]
```

**Option B: Pass via Paperclip Agent Config (Recommended for production)**

When configuring your ForgeLab agent in Paperclip UI:

```json
{
  "adapterType": "forgelab_local",
  "workspacePath": "/path/to/forgelab/workspace",
  "geminiApiKey": "[YOUR_API_KEY_HERE]",
  "agentName": "software-architect"
}
```

**Option C: Environment Variable (For deployed systems)**

```bash
export GEMINI_API_KEY=[YOUR_API_KEY_HERE]
# Then start Paperclip
pnpm dev
```

### 2. Install ForgeLab Dependencies

```bash
cd /path/to/forgelab
npm install
```

This installs `@google/genai` SDK required by the `forge` CLI.

### 3. Verify ForgeLab CLI Works

```bash
cd /path/to/forgelab
./forge --help
./forge --agent software-architect --wake-reason manual
```

### 4. Configure Paperclip Agent

In Paperclip UI:

1. Go to **Agents** → **Hire Agent**
2. Select adapter: `forgelab_local`
3. Configure:

```json
{
  "workspacePath": "/Users/you/projects/forgelab/workspace",
  "agentName": "software-architect",
  "geminiApiKey": "[YOUR_API_KEY_HERE]",
  "timeoutSec": 600,
  "logLevel": "info"
}
```

4. Set budget and approve
5. Assign tasks!

## Configuration Reference

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `workspacePath` | string | Absolute path to ForgeLab workspace directory |

### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `agentName` | string | - | Specific agent to run |
| `geminiApiKey` | string | env | Gemini API key (overrides .env) |
| `timeoutSec` | number | 300 | Execution timeout |
| `logLevel` | string | info | debug/info/warn/error |
| `workingDir` | string | workspacePath | Working directory |
| `env` | object | {} | Additional environment variables |

## Environment Variables

ForgeLab agents receive these from Paperclip:

| Variable | Description |
|----------|-------------|
| `FORGELAB_RUN_ID` | Paperclip run identifier |
| `FORGELAB_AGENT_ID` | Paperclip agent ID |
| `FORGELAB_COMPANY_ID` | Paperclip company ID |
| `FORGELAB_PAPERCLIP_CONTEXT` | JSON with full context |
| `FORGELAB_LOG_LEVEL` | Log verbosity |
| `GEMINI_API_KEY` | Required for LLM access |

## How It Works

### Execution Flow

1. **Paperclip triggers agent** (heartbeat, task assignment, manual)
2. **Adapter spawns `forge` CLI** with context
3. **ForgeLab loads agent identity** (IDENTITY.md, SOUL.md, AGENTS.md)
4. **ForgeLab calls Gemini API** with system prompt + task
5. **Response streams back** to Paperclip
6. **Paperclip records results** (logs, costs, summary)

### Prompt Construction

ForgeLab builds the LLM prompt from:

```
# Identity (from IDENTITY.md)
# Core Principles (from SOUL.md)  
# Workspace Guidelines (from AGENTS.md)
# Current Task (from Paperclip context)
# Wake Context (heartbeat/task/manual)

# Current Request
{user message based on wake reason}
```

### Paperclip Context

Agents receive structured context:

```json
{
  "paperclip": {
    "runId": "run_abc123",
    "company": { "id": "company_xyz" },
    "agent": { "id": "agent_123", "name": "Software Architect" },
    "task": { "key": "task_456" },
    "budget": { "monthlyLimit": 10.00, "remaining": 7.50 }
  }
}
```

## Troubleshooting

### "GEMINI_API_KEY is required"

**Solution 1:** Add to ForgeLab `.env`:
```
GEMINI_API_KEY=your-key-here
```

**Solution 2:** Pass in Paperclip config:
```json
{ "geminiApiKey": "your-key-here" }
```

**Solution 3:** Set environment:
```bash
export GEMINI_API_KEY=your-key-here
```

### "Agent workspace not found"

Ensure the agent exists:
```bash
ls /path/to/forgelab/workspace/agents/your-agent-name
```

### "forge: command not found"

Make sure the CLI is executable:
```bash
chmod +x /path/to/forgelab/forge
```

### Timeout Errors

Increase timeout in agent config:
```json
{ "timeoutSec": 600 }
```

## Security Considerations

### API Key Management

- **Development**: Store in `.env` (gitignored)
- **Production**: Use Paperclip secrets or environment variables
- **Never** commit API keys to git

### Workspace Isolation

ForgeLab agents run as local processes with filesystem access:

- Use separate workspaces per company if isolation needed
- Consider containerization for untrusted agents
- Review agent outputs before external actions

## Example: First Agent Task

1. **Hire the agent** in Paperclip UI
2. **Create a task**: "Review our codebase architecture"
3. **Assign to agent**: Select your ForgeLab agent
4. **Agent executes**:
   - Receives task context from Paperclip
   - Loads its identity and capabilities
   - Calls Gemini with full context
   - Returns analysis and recommendations
5. **Review results** in Paperclip dashboard

## Advanced: Custom Agent Behavior

### Modify Agent Identity

Edit `/workspace/agents/your-agent/IDENTITY.md`:

```markdown
- **Name:** Architect
- **Creature:** AI software architect
- **Vibe:** Analytical, precise, opinionated
- **Emoji:** 🏗️
```

### Add Custom Tools

Edit `/workspace/agents/your-agent/TOOLS.md`:

```markdown
### Available Tools

- Code analysis via GitHub API
- Architecture diagram generation
- Tech stack recommendations
```

### Configure Heartbeats

Edit `/workspace/agents/your-agent/HEARTBEAT.md`:

```markdown
## Heartbeat Checklist

- [ ] Check for new tasks
- [ ] Review ongoing projects
- [ ] Update documentation
- [ ] Monitor system health
```

## Next Steps

1. **Hire your first ForgeLab agent** in Paperclip
2. **Assign a simple task** to test the integration
3. **Review execution logs** in Paperclip dashboard
4. **Iterate on agent identity** based on results
5. **Scale up** with multiple specialized agents

## Support

- ForgeLab docs: `/workspace/AGENTS.md`
- Paperclip docs: https://github.com/paperclipai/paperclip
- Gemini API: https://ai.google.dev/

---

**Integration Version:** 0.1.0  
**Compatible With:** Paperclip v0.3+, ForgeLab v0.1+
