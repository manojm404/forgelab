# ForgeLab Standalone Platform

Welcome to the new ForgeLab platform! This replaces the Paperclip adapter with a fully autonomous, beautiful orchestration dashboard.

## Tech Stack
- **Frontend**: React, Vite, TailwindCSS v3, Framer Motion, Lucide Icons
- **Backend**: Express, Socket.io, Prisma ORM (SQLite currently)
- **Engine**: Local `forge` CLI (Gemini powered)

## How to Run
From the root of `forgelab`:

```bash
# Install dependencies
npm install

# Run both frontend and backend concurrently
npm run dev
```

- **UI Dashboard**: http://localhost:5173
- **API Server**: http://localhost:3001

## Features Built So Far
1. **Agent Sync Engine**: Automatically parses your `workspace/agents/` folder, extracts roles from `IDENTITY.md`, and syncs them to the database.
2. **Task Execution Engine**: Spawns the `./forge` CLI as a child process, captures its stdout/stderr, saves it to a PostgreSQL/SQLite database, and streams it over WebSockets.
3. **Premium UI Layout**: Built a beautiful Glassmorphism sidebar with Framer Motion spring physics, active state morphing, and a high-end dark mode aesthetic.
4. **Dashboard View**: Animated staggered stat cards and a live activity feed.

## Next Steps
- Build the "Agents" tab to list and edit all 154 synced agents.
- Build the "Console" tab with a live terminal UI that connects to the Socket.io stream.
# ForgeLab Platform

This is the standalone platform for ForgeLab, moving away from the Paperclip adapter model.

## Architecture
- **Frontend (ui/)**: Vite + React + TailwindCSS + shadcn/ui + Framer Motion
- **Backend (server/)**: Express + Socket.io + Prisma (SQLite for local MVP, ready for PostgreSQL)
- **Engine (forge)**: Existing Gemini-powered CLI engine

## Getting Started

### Start the Backend
```bash
cd server
npm run dev
```

### Start the Frontend
```bash
cd ui
npm run dev
```
