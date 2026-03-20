import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Terminal as TerminalIcon, Play, Square, Settings2, Trash2, ChevronDown } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';

interface Transcript {
  id: string;
  type: 'stdout' | 'stderr' | 'system';
  content: string;
  timestamp: string;
}

export function Console() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch agents for the dropdown
    axios.get('http://localhost:3001/api/agents').then(res => {
      setAgents(res.data);
      if (res.data.length > 0) setSelectedAgent(res.data[0].id);
    });

    // Connect to WebSocket
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('transcript', (data: Transcript) => {
      setTranscripts(prev => [...prev, data]);
    });

    newSocket.on('run:status', (data: { runId: string, status: string }) => {
      if (data.status === 'completed' || data.status === 'failed') {
        setIsRunning(false);
      }
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new transcripts arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts]);

  const handleRunTask = async () => {
    if (!selectedAgent || !taskDescription.trim()) return;

    try {
      setIsRunning(true);
      setTranscripts([{
        id: 'init',
        type: 'system',
        content: `Initializing task for agent...`,
        timestamp: new Date().toISOString()
      }]);

      // 1. Create Task
      const taskRes = await axios.post('http://localhost:3001/api/tasks', {
        title: 'Console Task',
        description: taskDescription,
        agentId: selectedAgent
      });

      // 2. Run Task
      const runRes = await axios.post(`http://localhost:3001/api/tasks/${taskRes.data.id}/run`);
      setCurrentRunId(runRes.data.run.id);

    } catch (error) {
      console.error('Failed to start task:', error);
      setIsRunning(false);
      setTranscripts(prev => [...prev, {
        id: 'error',
        type: 'stderr',
        content: 'Failed to connect to ForgeLab Engine.',
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const clearConsole = () => {
    setTranscripts([]);
  };

  const container: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="h-[calc(100vh-6rem)] flex flex-col space-y-6"
    >
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Execution Console</h1>
        <p className="text-white/50 text-lg">Run tasks and monitor agent thought processes in real-time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        
        {/* Left Control Panel */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <h2 className="font-semibold flex items-center gap-2 mb-4">
              <Settings2 size={18} className="text-emerald-400" />
              Configuration
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Select Agent</label>
                <div className="relative">
                  <select 
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                    disabled={isRunning}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-3 pr-10 text-white appearance-none focus:outline-none focus:border-emerald-500/50 disabled:opacity-50"
                  >
                    {agents.map(a => (
                      <option key={a.id} value={a.id} className="bg-gray-900">{a.name} ({a.role})</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" size={16} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Task Description</label>
                <textarea 
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  disabled={isRunning}
                  placeholder="E.g., Analyze the database schema in /src/db and propose optimizations..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/30 h-32 resize-none focus:outline-none focus:border-emerald-500/50 disabled:opacity-50"
                />
              </div>

              <button 
                onClick={handleRunTask}
                disabled={isRunning || !taskDescription.trim()}
                className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                  isRunning 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 cursor-not-allowed' 
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none'
                }`}
              >
                {isRunning ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    Run Task
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Terminal Area */}
        <div className="lg:col-span-3 bg-[#0c0c0c] border border-white/10 rounded-2xl flex flex-col overflow-hidden relative shadow-2xl">
          {/* Terminal Header */}
          <div className="h-12 border-b border-white/10 bg-black/40 flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-2">
              <TerminalIcon size={16} className="text-white/50" />
              <span className="text-sm font-mono text-white/70">forge-engine-output</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={clearConsole}
                className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-white/50 hover:text-white"
                title="Clear Console"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Terminal Body */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-1"
          >
            {transcripts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-white/30 italic">
                Awaiting task execution...
              </div>
            ) : (
              transcripts.map((t, i) => (
                <div key={i} className="flex gap-4 group">
                  <span className="text-white/20 select-none shrink-0 w-20">
                    {new Date(t.timestamp).toLocaleTimeString([], { hour12: false })}
                  </span>
                  <div className={`whitespace-pre-wrap break-words ${
                    t.type === 'stderr' ? 'text-red-400' :
                    t.type === 'system' ? 'text-blue-400' :
                    t.content.includes('## Response') ? 'text-emerald-400 font-bold mt-4' :
                    t.content.startsWith('[forgelab]') ? 'text-white/50' :
                    'text-white/90'
                  }`}>
                    {t.content}
                  </div>
                </div>
              ))
            )}
            {isRunning && (
              <div className="flex gap-4 mt-2">
                <span className="text-white/20 w-20">...</span>
                <span className="w-2 h-4 bg-emerald-400 animate-pulse" />
              </div>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
