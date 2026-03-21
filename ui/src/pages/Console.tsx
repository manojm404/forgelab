import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal as TerminalIcon, Play, Square, Settings2, Trash2,
  ChevronDown, Zap, Cpu, Sparkles, Shield, Activity,
  Command, Globe, List
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';

interface Transcript {
  id: string;
  type: 'stdout' | 'stderr' | 'system';
  content: string;
  timestamp: string;
}

export function Console() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialAgentId = queryParams.get('agentId');

  const [socket, setSocket] = useState<Socket | null>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState(initialAgentId || '');
  const [taskDescription, setTaskDescription] = useState('');
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch agents for the dropdown
    axios.get('http://localhost:3001/api/agents')
      .then(res => {
        setAgents(res.data);
        if (!selectedAgent && res.data.length > 0) {
          setSelectedAgent(res.data[0].id);
        }
      })
      .catch(err => {
        console.warn('Backend not reachable:', err.message);
      });

  // Connect to WebSocket
    try {
      const newSocket = io('http://localhost:3001', { timeout: 5000 });
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
    } catch (e) {
      console.warn('WebSocket connection failed:', e);
    }
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new transcripts arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts]);

  const handleRunTask = async () => {
    if (!selectedAgent || !taskDescription.trim()) return;

    setIsRunning(true);
    const agentName = agents.find(a => a.id === selectedAgent)?.name || 'Agent';
    
    setTranscripts(prev => [...prev, {
      id: 'user-' + Date.now(),
      type: 'system',
      content: `> Executing Link: ${agentName}`,
      timestamp: new Date().toISOString()
    }, {
      id: 'task-' + Date.now(),
      type: 'stdout',
      content: `Instruction: ${taskDescription}`,
      timestamp: new Date().toISOString()
    }]);

    try {
      // 1. Create Task
      const taskRes = await axios.post('http://localhost:3001/api/tasks', {
        title: 'Console Task',
        description: taskDescription,
        agentId: selectedAgent
      });

      // 2. Run Task
      const runRes = await axios.post(`http://localhost:3001/api/tasks/${taskRes.data.id}/run`);
      setCurrentRunId(runRes.data.run.id);
      setTaskDescription(''); // Clear input for next turn

    } catch (error) {
      console.error('Failed to start task:', error);
      setIsRunning(false);
      setTranscripts(prev => [...prev, {
        id: 'error',
        type: 'stderr',
        content: 'Failed to execute task. Check server connectivity.',
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const clearConsole = async () => {
    setTranscripts([]);
  };

  const getAgentSpecialty = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('arch') || n.includes('engineer') || n.includes('dev') || n.includes('sre')) return 'Engineering';
    if (n.includes('strat') || n.includes('manager') || n.includes('lead') || n.includes('project')) return 'Strategy';
    if (n.includes('des') || n.includes('artist') || n.includes('creative')) return 'Creative';
    if (n.includes('spec') || n.includes('expert') || n.includes('steward')) return 'Operations';
    if (n.includes('audit') || n.includes('security') || n.includes('test')) return 'Quality';
    if (n.includes('res') || n.includes('anlyst') || n.includes('data')) return 'Research';
    if (n.includes('market') || n.includes('seo') || n.includes('social')) return 'Marketing';
    return 'Agent';
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 25 } }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="h-[calc(100vh-8rem)] flex flex-col space-y-8"
    >
      <div className="flex items-end justify-between">
        <motion.div variants={item} className="space-y-2">
          <div className="flex items-center gap-2 text-blue-400 font-black uppercase tracking-[0.2em] text-xs">
            <Zap size={14} fill="currentColor" />
            Neural Link Active
          </div>
          <h1 className="text-5xl font-black tracking-tighter leading-none">
            LOGIC <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">CONSOLE.</span>
          </h1>
        </motion.div>

        <motion.div variants={item} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 backdrop-blur-xl">
           <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest">
              <Activity size={12} />
              Link: 24ms
           </div>
           <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-black uppercase tracking-widest">
              <Shield size={12} />
              Secure
           </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">

        {/* Left Control Panel */}
        <motion.div variants={item} className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Cpu size={120} />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black flex items-center gap-3">
                <Settings2 size={20} className="text-blue-400" />
                Handshake Config
              </h2>
              <p className="text-white/30 text-xs font-bold uppercase tracking-widest">Configure agent parameters</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3 group/input">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 group-focus-within/input:text-blue-400 transition-colors ml-1">Target Agent</label>
                <div className="relative">
                  <select
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                    disabled={isRunning}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-4 pr-10 text-white appearance-none focus:outline-none focus:border-blue-500/50 disabled:opacity-50 font-bold text-sm tracking-wide transition-all"
                  >
                    {agents.map(a => (
                      <option key={a.id} value={a.id} className="bg-[#0c0c0c]">{a.name} — {getAgentSpecialty(a.name)}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-blue-400 transition-colors pointer-events-none" size={18} />
                </div>
              </div>

              <div className="space-y-3 group/input">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 group-focus-within/input:text-blue-400 transition-colors ml-1">Neural Instruction</label>
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  disabled={isRunning}
                  placeholder="E.g., Analyze the logic flow of the auth system and identify potential race conditions..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white placeholder:text-white/10 h-48 resize-none focus:outline-none focus:border-blue-500/50 disabled:opacity-50 font-medium text-sm tracking-wide transition-all leading-relaxed"
                />
              </div>

              <button
                onClick={handleRunTask}
                disabled={isRunning || !taskDescription.trim()}
                className={`w-full relative group/btn overflow-hidden rounded-2xl p-[1px] transition-all active:scale-95 ${
                  isRunning ? 'cursor-not-allowed opacity-80' : 'hover:-translate-y-1'
                }`}
              >
                <span className={`absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-[length:200%_100%] animate-[gradient_3s_linear_infinite] rounded-2xl transition-opacity ${
                  isRunning ? 'opacity-50' : 'opacity-80 group-hover/btn:opacity-100'
                }`} />
                <div className="relative bg-[#0c0c0c] rounded-2xl py-4 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-sm transition-colors group-hover/btn:bg-transparent">
                  {isRunning ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play size={18} fill="currentColor" />
                      Execute Link
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Tokens</p>
                <p className="text-xl font-black">1.2k <span className="text-[10px] text-white/20">avg</span></p>
             </div>
             <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Latency</p>
                <p className="text-xl font-black">18ms <span className="text-[10px] text-white/20">peak</span></p>
             </div>
          </div>
        </motion.div>

        {/* Right Terminal Area */}
        <motion.div variants={item} className="lg:col-span-8 bg-[#080808] border border-white/10 rounded-[2.5rem] flex flex-col overflow-hidden relative shadow-2xl group">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none" />
          
          {/* Terminal Header */}
          <div className="h-16 border-b border-white/10 bg-black/40 flex items-center justify-between px-8 shrink-0 backdrop-blur-xl relative z-10">
            <div className="flex items-center gap-4">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <div className="h-4 w-[1px] bg-white/10 mx-2" />
              <div className="flex items-center gap-2">
                <Command size={16} className="text-white/30" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Neural_Output_v4.0</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-4 mr-4 text-[10px] font-black uppercase tracking-widest text-white/20">
                <span className="flex items-center gap-1.5"><Globe size={12} /> Cluster: US-EAST</span>
                <span className="flex items-center gap-1.5"><List size={12} /> Mode: Stream</span>
              </div>
              <button
                onClick={clearConsole}
                className="p-2.5 hover:bg-white/5 rounded-xl transition-all text-white/20 hover:text-white active:scale-90"
                title="Clear Output"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {/* Terminal Body */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-8 font-mono text-sm space-y-2 custom-scrollbar relative z-10"
          >
            <AnimatePresence mode="popLayout">
              {transcripts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/10 space-y-4">
                  <TerminalIcon size={64} className="opacity-5" />
                  <p className="font-black uppercase tracking-[0.3em] text-xs">Awaiting neural pulse...</p>
                </div>
              ) : (
                transcripts.map((t, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-6 group py-1"
                  >
                    <span className="text-white/10 select-none shrink-0 w-24 font-black text-[10px] pt-1">
                      {new Date(t.timestamp).toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 2 })}
                    </span>
                    <div className={`flex-1 whitespace-pre-wrap break-words leading-relaxed ${
                      t.type === 'stderr' ? 'text-red-400 bg-red-500/5 px-2 rounded' :
                      t.type === 'system' ? 'text-blue-400 font-bold border-l-2 border-blue-500/30 pl-4 my-2' :
                      t.content.includes('## Response') ? 'text-emerald-400 font-black text-lg mt-8 mb-4 border-t border-white/5 pt-8' :
                      t.content.startsWith('[forgelab]') ? 'text-white/30 italic' :
                      'text-white/70 group-hover:text-white transition-colors'
                    }`}>
                      {t.content}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
            {isRunning && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-6 py-4"
              >
                <span className="text-white/10 w-24">...</span>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-blue-500 animate-[pulse_1s_infinite]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-500/50">Processing Stream</span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
