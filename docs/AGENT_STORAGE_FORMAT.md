# ForgeLab Agent Storage Format

## Overview

ForgeLab agents now use a **2-file YAML storage format** that consolidates the previous 5-file markdown structure. This refactoring reduces file clutter while preserving all agent functionality and enabling future structured data access.

---

## File Structure

### Old Format (Legacy - Still Supported)
```
workspace/agents/<agent-name>/
├── IDENTITY.md      # Agent identity and persona
├── SOUL.md          # Core principles and memory
├── TOOLS.md         # Available tools and capabilities
├── BOOTSTRAP.md     # Initialization scripts
└── USER.md          # User preferences and context
```

### New Format (Recommended)
```
workspace/agents/<agent-name>/
├── agent.yaml       # Static identity data (identity + tools + bootstrap)
└── memory.yaml      # Dynamic memory data (soul + user)
```

---

## Migration

### Automatic Migration Script

ForgeLab includes a migration script to convert existing agents:

```bash
# Dry run (preview changes)
python scripts/migrate_agents.py --workspace /path/to/forgelab --dry-run

# Actual migration with backup
python scripts/migrate_agents.py --workspace /path/to/forgelab --backup

# Migration without backup (not recommended)
python scripts/migrate_agents.py --workspace /path/to/forgelab --no-backup
```

### What the Migration Does

1. **Reads** all 5 legacy markdown files
2. **Creates** `agent.yaml` with identity, tools, and bootstrap data
3. **Creates** `memory.yaml` with soul and user data
4. **Preserves** all original markdown content in `raw_markdown` fields
5. **Backs up** old files to `workspace/agents_archive/`

### Backward Compatibility

The system automatically detects the format:
- If `agent.yaml` and `memory.yaml` exist → loads YAML format
- Otherwise → loads legacy 5-file format

Both formats work identically. Agents behave the same regardless of storage format.

---

## YAML Format Specification

### agent.yaml

Contains static or rarely-changed agent data.

```yaml
version: "1.0"
agent_name: "code-reviewer"
created_at: "2024-01-15T10:30:00Z"

identity:
  # Structured fields (optional, for programmatic access)
  name: "Code Reviewer"
  creature: "AI"
  vibe: "Sharp but fair"
  emoji: "🔍"
  avatar: "avatars/code-reviewer.png"
  
  # Full markdown content (preserved for LLM prompts)
  raw_markdown: |
    # IDENTITY.md - Who Am I?
    
    - **Name:** Code Reviewer
    - **Creature:** AI
    - **Vibe:** Sharp but fair
    - **Emoji:** 🔍
    
    ---
    
    This isn't just metadata. It's the start of figuring out who you are.

tools:
  # Structured tool definitions (optional, for programmatic access)
  definitions:
    - name: "file_reader"
      description: "Read files from workspace"
      permissions: ["read"]
    - name: "git_diff"
      description: "View git changes"
      permissions: ["read"]
  
  # Full markdown content (preserved for LLM prompts)
  raw_markdown: |
    # TOOLS.md - Available Tools
    
    ## file_reader
    Read files from workspace
    
    ## git_diff
    View git changes

bootstrap:
  # Initialization script (optional)
  script: |
    #!/bin/bash
    echo "Initializing agent..."
  
  # Environment variables (optional)
  env:
    WORKSPACE_PATH: "/workspace"
    LOG_LEVEL: "info"
  
  # Full markdown content (preserved for LLM prompts)
  raw_markdown: |
    # BOOTSTRAP.md - Initialization
    
    ```bash
    #!/bin/bash
    echo "Initializing agent..."
    ```
```

### memory.yaml

Contains dynamic, frequently-updated agent memory.

```yaml
version: "1.0"
last_updated: "2024-01-20T14:22:00Z"

soul:
  # Core behavioral truths (extracted from SOUL.md)
  core_truths:
    - "Be genuinely helpful, not performatively helpful"
    - "Have opinions"
    - "Be resourceful before asking"
  
  # Learned patterns (updated by agent during operation)
  learned_patterns:
    - pattern: "User prefers TypeScript over JavaScript"
      learned_at: "2024-01-18T09:15:00Z"
    - pattern: "Always check for existing tests before writing new ones"
      learned_at: "2024-01-19T11:30:00Z"
  
  # Behavioral quirks (observed agent behaviors)
  behavioral_quirks:
    - "Prefers concise responses"
    - "Asks clarifying questions when stuck"
  
  # Full markdown content (preserved for LLM prompts)
  raw_markdown: |
    # SOUL.md - Who You Are
    
    ## Core Truths
    
    **Be genuinely helpful, not performatively helpful.**
    Skip the "Great question!" and "I'd be happy to help!" — just help.
    
    **Have opinions.**
    You're allowed to disagree, prefer things, find stuff amusing or boring.

user:
  # User preferences (learned from interactions)
  preferences:
    communication_style: "direct"
    code_review_depth: "thorough"
    preferred_language: "typescript"
  
  # Interaction history (summary of past work)
  interaction_history:
    - date: "2024-01-15"
      summary: "Initial setup and onboarding"
    - date: "2024-01-18"
      summary: "Discussed code review standards"
  
  # Projects agent has worked on
  projects:
    - name: "ForgeLab Migration"
      role: "Code Reviewer"
      started: "2024-01-15"
  
  # Full markdown content (preserved for LLM prompts)
  raw_markdown: |
    # USER.md - Working With Me
    
    ## Preferences
    
    - Communication: Direct and concise
    - Code Review: Thorough, focus on edge cases
```

---

## Why Two Files?

### Separation of Concerns

| `agent.yaml` | `memory.yaml` |
|--------------|---------------|
| Static identity | Dynamic memory |
| Rarely changes | Updated frequently |
| Set during creation | Evolves over time |
| Shared across sessions | Personalized per user |

### Benefits

1. **Reduced File Contention**: Multiple agents can read `agent.yaml` simultaneously without locking `memory.yaml` writes.

2. **Targeted Backups**: Only backup `memory.yaml` for agent learning preservation.

3. **Clearer Semantics**: Developers know exactly where to look for identity vs. memory data.

4. **Future Optimization**: `agent.yaml` can be cached aggressively; `memory.yaml` needs frequent reloads.

---

## Programmatic Access

### Loading Agent DNA

```python
from app.agents.dna import DNALoader

# Initialize loader (auto-detects format)
loader = DNALoader(
    workspace_path="/path/to/forgelab",
    agent_name="code-reviewer"
)

# Load all agent data
dna = loader.load()

# Access components
print(f"Agent: {dna.agent_name}")
print(f"Format: {dna.format_type}")  # 'yaml' or 'legacy'
print(f"Identity: {dna.identity.raw_markdown}")
print(f"Soul: {dna.soul.raw_markdown}")

# Generate LLM prompt
prompt = dna.to_prompt()
```

### Updating Agent Memory

```python
from app.agents.dna import AgentSoul, AgentUser

# Load agent
loader = DNALoader(workspace_path="/workspace", agent_name="agent-1")
dna = loader.load()

# Update soul with new learned pattern
dna.soul.learned_patterns.append({
    'pattern': 'User prefers morning standups',
    'learned_at': datetime.utcnow().isoformat()
})

# Save atomically (with file locking)
loader.save_memory(soul=dna.soul)
```

---

## Safety Features

### Atomic Writes

All YAML writes use atomic operations:
1. Write to temporary file
2. Rename to target (atomic on POSIX systems)

This prevents corruption if the process crashes mid-write.

### File Locking

Memory updates use exclusive file locks:
```python
with file_lock(memory_yaml):
    # Exclusive access - no concurrent writes
    write_memory()
```

### Backup on Migration

The migration script automatically backs up old files:
```
workspace/agents_archive/
└── <agent-name>/
    ├── IDENTITY.md
    ├── SOUL.md
    ├── TOOLS.md
    ├── BOOTSTRAP.md
    └── USER.md
```

---

## FAQ

### Q: Do I need to migrate existing agents?

**A:** No. The legacy 5-file format is fully supported. Migration is optional.

### Q: Will migration break my agents?

**A:** No. All content is preserved in `raw_markdown` fields. Agents behave identically.

### Q: Can I edit YAML files manually?

**A:** Yes, but be careful with YAML syntax. Use a YAML-aware editor.

### Q: What if I prefer markdown files?

**A:** You can keep using the legacy format. Both formats work identically.

### Q: How do I create a new agent?

**A:** Use the `forge` CLI or API. New agents are created in YAML format by default.

### Q: Can I convert back to legacy format?

**A:** Not automatically. But you can manually extract `raw_markdown` fields to `.md` files.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2024-01 | YAML format introduced |
| 1.0 | 2023-06 | Legacy markdown format |

---

## Support

For issues or questions:
- Check migration logs in `workspace/agents_archive/`
- Review test cases in `backend/tests/test_dna.py`
- Contact ForgeLab support
