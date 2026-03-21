import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Shield, ChevronRight, Terminal, Lock, Cpu, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const navigate = useNavigate();

  const addTerminalLine = (line: string) => {
    setTerminalLines(prev => [...prev, line].slice(-5));
  };

  useEffect(() => {
    const sequence = [
      "Initializing ForgeLab v0.1.0...",
      "Connecting to Neural Engine...",
      "Establishing Secure Tunnel...",
      "Awaiting Credentials..."
    ];
    
    sequence.forEach((line, i) => {
      setTimeout(() => addTerminalLine(line), i * 800);
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    
    addTerminalLine("Authenticating user...");
    
    // Simulate auth sequence
    setTimeout(() => addTerminalLine("Accessing encrypted vault..."), 1000);
    setTimeout(() => addTerminalLine("Identity verified."), 2000);
    setTimeout(() => {
      addTerminalLine("Opening Cyber Gate...");
      localStorage.setItem('forgelab_auth', 'true');
      setTimeout(() => navigate('/'), 1000);
    }, 3000);
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white flex items-center justify-center p-4 overflow-hidden relative">
      {/* Cinematic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[150px] animate-pulse" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50" />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Side: Brand & Status */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 text-emerald-400">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <Bot size={28} />
              </div>
              <span className="text-sm font-black uppercase tracking-[0.3em]">ForgeLab Platform</span>
            </div>
            <h1 className="text-7xl font-black tracking-tighter leading-none">
              THE FUTURE OF <br />
              <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                AI WORKFORCES.
              </span>
            </h1>
            <p className="text-white/40 text-xl max-w-md leading-relaxed">
              Orchestrate multi-agent teams with persistent memory, specialized identities, and real-time collaboration.
            </p>
          </motion.div>

          {/* Terminal Feedback */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-black/60 border border-white/10 rounded-2xl p-6 font-mono text-xs space-y-2 backdrop-blur-xl shadow-2xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="ml-2 text-white/30">system_logs.sh</span>
            </div>
            <div className="space-y-1">
              {terminalLines.map((line, i) => (
                <div key={i} className="flex gap-2 text-emerald-400/70">
                  <span className="text-white/20 select-none">[{new Date().toLocaleTimeString()}]</span>
                  <span className={i === terminalLines.length - 1 ? "text-emerald-400 animate-pulse" : ""}>
                    {">"} {line}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Side: Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <div className="relative bg-[#0c0c0c]/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Cpu size={120} />
            </div>

            <div className="mb-10 space-y-2">
              <h2 className="text-3xl font-black flex items-center gap-3">
                Enter Workspace <Sparkles className="text-emerald-400" size={24} />
              </h2>
              <p className="text-white/40 font-medium">Verify your identity to proceed.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2 group/input">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 group-focus-within/input:text-emerald-400 transition-colors ml-1">Terminal ID</label>
                  <div className="relative">
                    <input
                      required
                      type="text"
                      placeholder="admin"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/10 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                    />
                    <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-emerald-400 transition-colors" size={18} />
                  </div>
                </div>

                <div className="space-y-2 group/input">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 group-focus-within/input:text-emerald-400 transition-colors ml-1">Access Key</label>
                  <div className="relative">
                    <input
                      required
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/10 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-emerald-400 transition-colors" size={18} />
                  </div>
                </div>
              </div>

              <button
                disabled={isAuthenticating}
                className="w-full relative group/btn overflow-hidden rounded-2xl p-[1px] transition-transform active:scale-95"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500 bg-[length:200%_100%] animate-[gradient_3s_linear_infinite] rounded-2xl opacity-80 group-hover/btn:opacity-100 transition-opacity" />
                <div className="relative bg-[#0c0c0c] rounded-2xl py-4 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-sm transition-colors group-hover/btn:bg-transparent">
                  {isAuthenticating ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Initialize Session <ChevronRight size={18} />
                    </>
                  )}
                </div>
              </button>
            </form>

            <div className="mt-10 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
              <div className="flex items-center gap-2">
                <Shield size={12} />
                Secure Core
              </div>
              <div>v0.1.0-alpha</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
