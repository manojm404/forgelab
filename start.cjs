#!/usr/bin/env node

/**
 * ForgeLab One-Command Start Script
 * 
 * Usage: node start.js
 * 
 * This script:
 * 1. Starts the backend server
 * 2. Starts the UI dev server
 * 3. Auto-opens browser when UI is ready
 * 4. Shows clear status for both processes
 */

const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

const ROOT_DIR = __dirname;
const SERVER_DIR = path.join(ROOT_DIR, 'server');
const UI_DIR = path.join(ROOT_DIR, 'ui');
const UI_PORT = 5173;

console.log('🚀 Starting ForgeLab...\n');

// Check if server directory exists
const fs = require('fs');
if (!fs.existsSync(SERVER_DIR)) {
  console.error('❌ Server directory not found. Please run this from the ForgeLab root.');
  process.exit(1);
}

// Start backend server
console.log('📦 Starting backend server...');
const serverProcess = spawn('npm', ['run', 'dev'], {
  cwd: SERVER_DIR,
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: false,
  env: { ...process.env, FORCE_COLOR: '1' }
});

serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  if (output.includes('running') || output.includes('listening')) {
    console.log('✅ Backend server ready');
  }
});

serverProcess.stderr.on('data', (data) => {
  const output = data.toString();
  if (output.includes('Error') || output.includes('error')) {
    console.error('❌ Backend error:', output.trim());
  }
});

serverProcess.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Backend server exited with code', code);
  }
});

// Wait for UI to be ready, then open browser
function waitForUI(retries = 30) {
  return new Promise((resolve, reject) => {
    let attempt = 0;
    
    const check = () => {
      attempt++;
      http.get(`http://localhost:${UI_PORT}`, (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          retry();
        }
      }).on('error', retry);
    };
    
    const retry = () => {
      if (attempt < retries) {
        setTimeout(check, 1000);
      } else {
        reject(new Error('UI not ready after 30 seconds'));
      }
    };
    
    check();
  });
}

// Start UI
console.log('🎨 Starting UI...');
const uiProcess = spawn('npm', ['run', 'dev'], {
  cwd: UI_DIR,
  stdio: 'inherit',  // Use inherit to keep process alive
  shell: false,       // Don't use shell
  env: { ...process.env, FORCE_COLOR: '1' }
});

let uiReady = false;

if (uiProcess.stdout) {
  uiProcess.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('ready') || output.includes('Local:')) {
      if (!uiReady) {
        uiReady = true;
        console.log('✅ UI ready\n');
        console.log('🌐 Opening browser...\n');

        // Open browser (dynamic import for ES module)
        (async () => {
          try {
            const open = (await import('open')).default;
            await open(`http://localhost:${UI_PORT}`);
          } catch (err) {
            console.log('🌐 Open browser manually: http://localhost:' + UI_PORT);
          }
        })();

        console.log('─'.repeat(50));
        console.log('✨ ForgeLab is running!');
        console.log('─'.repeat(50));
        console.log(`📊 Dashboard: http://localhost:${UI_PORT}`);
        console.log('🔌 Backend: http://localhost:8000 (auto-detected)');
        console.log('─'.repeat(50));
        console.log('\nPress Ctrl+C to stop all servers\n');
      }
    }
  });
}

uiProcess.stderr?.on('data', (data) => {
  const output = data.toString();
  if (output.includes('Error') || output.includes('error')) {
    console.error('❌ UI error:', output.trim());
  }
});

uiProcess.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ UI exited with code', code);
  }
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down...');
  serverProcess.kill();
  uiProcess.kill();
  process.exit(0);
});

// Handle errors
process.on('uncaughtException', (err) => {
  console.error('\n❌ Fatal error:', err.message);
  serverProcess.kill();
  uiProcess.kill();
  process.exit(1);
});
