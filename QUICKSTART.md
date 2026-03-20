# ForgeLab - Quick Start Guide

## One Command to Rule Them All

```bash
npm run dev
```

That's it. Seriously.

---

## What Happens

1. ✅ Backend server starts automatically
2. ✅ UI dev server starts automatically  
3. ✅ Browser opens automatically
4. ✅ Backend URL auto-detected (tries ports 8000, 8001, 3001, 8080, 5000)

---

## About PROJECT_CONTEXT.md

**This file is NOT for the UI.** It's for Qwen (the AI assistant) to:
- Read session history before starting
- Understand what was done in previous sessions
- Continue work without repeating steps

**Location:** `/workspace/PROJECT_CONTEXT.md`

**Updated automatically** by the ContextManager when:
- Agents are hired/updated
- Tasks are approved
- Major decisions are made

**Think of it as:** Qwen's memory file - not a user-facing feature.

---

## What Happens

1. ✅ Backend server starts automatically
2. ✅ UI dev server starts automatically  
3. ✅ Browser opens automatically
4. ✅ Backend URL auto-detected (tries ports 8000, 8001, 3001, 8080, 5000)

---

## What You'll See

```
🚀 Starting ForgeLab...

📦 Starting backend server...
✅ Backend server ready

🎨 Starting UI...
✅ UI ready

🌐 Opening browser...

──────────────────────────────────────────────────
✨ ForgeLab is running!
──────────────────────────────────────────────────
📊 Dashboard: http://localhost:5173
🔌 Backend: http://localhost:8000 (auto-detected)
──────────────────────────────────────────────────

Press Ctrl+C to stop all servers
```

---

## Features That Just Work

### 🌗 Dark Mode
- Automatically respects your system preference
- No toggle to click, no settings to change

### 🤖 Agent Avatars
- Emojis read directly from `agent.yaml`
- Shows in team dashboard automatically

### 🟢 Live Status
- Connection indicator shows real-time status
- Green = Connected, Yellow = Connecting, Red = Error
- Hover to see detected backend URL

### 📋 Color-Coded Messages
- Blue = Proposal
- Yellow = Review
- Emerald = Decision
- Purple = Handoff

---

## Troubleshooting

### "Backend not detected"
The UI tries these ports automatically: 8000, 8001, 3001, 8080, 5000

If your backend runs on a different port, it will show as disconnected.

**Fix:** Start backend on one of the supported ports, or the UI will show a "Retry" button.

### "Port already in use"
Another process is using port 5173 or 8000.

**Fix:**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Then run again
npm run dev
```

### "Module not found: open"
The `open` package wasn't installed.

**Fix:**
```bash
npm install
npm run dev
```

---

## Manual Control (If You Need It)

### Start Backend Only
```bash
npm run start:server
```

### Start UI Only
```bash
npm run start:ui
```

### Run Migration
```bash
npm run migrate
```

### Cleanup Old Files
```bash
npm run cleanup
```

---

## Philosophy

> "Should run less commands and run the UI"

Every feature must pass the test:
> "Can a user benefit from this without doing any setup?"

If yes → included.
If no → left out.

---

## What's NOT Required

- ❌ No environment variables to set
- ❌ No config files to edit
- ❌ No multiple commands to run
- ❌ No "first install this" steps
- ❌ No reading documentation

Just:
```bash
npm run dev
```

And you're done.
