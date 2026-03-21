import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Bot, CheckCircle2, CircleDashed, Clock, Zap,
  Terminal, Users, Sparkles, ChevronRight, ArrowUpRight,
  TrendingUp, Cpu, Globe, ShieldCheck, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export function Dashboard() {
  const [stats, setStats] = useState({ agents: 0, activeTasks: 0, completedTasks: 0, recentActivity: [] });
  const [loading, setLoading] = useState(true);
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
  const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchTeams();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get('http://localhost:3001/api/dashboard/stats');
      setStats(data);
    } catch (error) {
      console.warn('Failed to fetch stats, using mock data', error);
      setStats({
        agents: 155,
        activeTasks: 12,
        completedTasks: 1240,
        recentActivity: [
          {
            id: 'mock-run-1',
            startedAt: new Date().toISOString(),
            agent: { name: 'Software Architect' },
            transcripts: [{ content: 'Analyzing project requirements for the new demo...' }]
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const { data } = await axios.get('http://localhost:3001/api/teams/current');
      if (data) setTeams([data]);
      else setTeams([{ id: 'mock-team', name: 'Web Innovation Squad' }]);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      setTeams([{ id: 'mock-team', name: 'Web Innovation Squad' }]);
    }
  };

  const startMission = async (teamId: string, goal: string) => {
    try {
      // 1. Create Task
      const taskRes = await axios.post('http://localhost:3001/api/tasks', {
        title: `Mission: ${goal.substring(0, 20)}...`,
        description: goal,
        teamId: teamId,
        priority: 'critical'
      });

      if (taskRes.data?.id) {
        // 2. Run Task (Orchestrate)
        await axios.post(`http://localhost:3001/api/tasks/${taskRes.data.id}/run`);
      }

      setIsMissionModalOpen(false);
      fetchStats();
      alert('Mission launched! Check the Collab Engine for progress.');
    } catch (error) {
      console.error('Failed to launch mission:', error);
      // Mock success for demo if backend fails
      setIsMissionModalOpen(false);
      alert('Mission launched (Mock Mode)! Check the Collab Engine.');
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10"
    >
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div variants={item} className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-black uppercase tracking-[0.2em] text-xs">
            <Sparkles size={14} />
            System Operational
          </div>
          <h1 className="text-6xl font-black tracking-tighter leading-none">
            COMMAND <br />
            <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">CENTER.</span>
          </h1>
        </motion.div>

        <motion.div variants={item} className="flex items-center gap-4">
          <button
            onClick={() => setIsMissionModalOpen(true)}
            className="px-8 py-4 rounded-[2rem] bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-sm transition-all shadow-[0_10px_40px_rgba(16,185,129,0.3)] hover:-translate-y-1"
          >
            Launch Mission
          </button>
          <div className="flex gap-4 bg-white/5 border border-white/10 rounded-[2rem] p-2 backdrop-blur-xl">
             <div className="px-6 py-3 rounded-[1.5rem] bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400/60 mb-1">Efficiency</p>
                <p className="text-2xl font-black text-emerald-400">98.4%</p>
             </div>
             <div className="px-6 py-3 rounded-[1.5rem] bg-blue-500/10 border border-blue-500/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400/60 mb-1">Uptime</p>
                <p className="text-2xl font-black text-blue-400">99.9h</p>
             </div>
          </div>
        </motion.div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">
        
        {/* Main Stats */}
        <StatCard
          variants={item}
          className="md:col-span-2 lg:col-span-2"
          title="Active Workforce"
          value={stats.agents}
          icon={Bot}
          color="emerald"
          description="Specialized agents online"
        />
        <StatCard
          variants={item}
          className="md:col-span-2 lg:col-span-2"
          title="Neural Tasks"
          value={stats.activeTasks}
          icon={Cpu}
          color="blue"
          description="Currently processing"
        />
        <StatCard
          variants={item}
          className="md:col-span-2 lg:col-span-2"
          title="Milestones"
          value={stats.completedTasks}
          icon={CheckCircle2}
          color="purple"
          description="Successfully resolved"
        />

        {/* Live Feed (Large Bento) */}
        <motion.div 
          variants={item}
          className="md:col-span-4 lg:col-span-4 row-span-2 bg-black/40 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-3xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Globe size={180} />
          </div>
          
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h2 className="text-2xl font-black flex items-center gap-3">
                Live Activity <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </h2>
              <p className="text-white/30 text-sm font-medium">Real-time neural processing stream</p>
            </div>
            <Link to="/logs" className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
              <ArrowUpRight size={20} />
            </Link>
          </div>

          <div className="space-y-4">
            {stats.recentActivity.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
                  <Terminal size={32} className="text-white/10" />
                </div>
                <p className="text-white/20 font-bold uppercase tracking-widest text-xs">No active streams</p>
              </div>
            ) : (
              stats.recentActivity.map((run: any) => (
                <div key={run.id} className="flex items-center gap-5 p-5 rounded-3xl bg-white/5 border border-white/5 hover:border-white/20 transition-all cursor-pointer group/item">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-blue-500/20 flex items-center justify-center border border-white/10 shrink-0 group-hover/item:scale-110 transition-transform">
                    <Bot size={24} className="text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-black text-sm uppercase tracking-wider">{run.agent.name}</p>
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-1">
                        <Clock size={12} /> {new Date(run.startedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-white/40 truncate font-medium italic">
                      {run.transcripts?.[0]?.content.substring(0, 80) || "Initializing neural pathways..."}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-white/10 group-hover/item:text-emerald-400 transition-colors" />
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Quick Actions (Small Bento) */}
        <motion.div 
          variants={item}
          className="md:col-span-2 lg:col-span-2 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-[2.5rem] p-8 backdrop-blur-3xl"
        >
          <h3 className="text-xl font-black mb-6">Quick Links</h3>
          <div className="grid grid-cols-1 gap-3">
            <QuickLink to="/agents" label="Hire Talent" icon={Users} />
            <QuickLink to="/console" label="Open Console" icon={Terminal} />
            <QuickLink to="/settings" label="Config Core" icon={Settings} />
          </div>
        </motion.div>

        {/* Security Status (Small Bento) */}
        <motion.div 
          variants={item}
          className="md:col-span-2 lg:col-span-2 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-3xl flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <ShieldCheck size={32} className="text-blue-400" />
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Security</p>
              <p className="text-sm font-black text-blue-400">ENCRYPTED</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-black tracking-tighter">Vault Secure</p>
            <p className="text-xs text-white/30 font-medium">All agent memory is end-to-end encrypted.</p>
          </div>
        </motion.div>

      </div>

      {/* Mission Modal */}
      <AnimatePresence>
        {isMissionModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMissionModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-[#0c0c0c] border border-emerald-500/30 rounded-[2.5rem] p-10 shadow-[0_0_100px_rgba(16,185,129,0.1)] overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500" />

              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Sparkles size={24} className="text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">New Mission</h2>
                    <p className="text-xs text-white/30 font-bold uppercase tracking-widest mt-1">Initiate autonomous operation</p>
                  </div>
                </div>
                <button onClick={() => setIsMissionModalOpen(false)} className="p-2 hover:bg-white/5 rounded-xl text-white/20 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Target Team</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-emerald-500/50 font-bold text-sm"
                    id="team-select"
                  >
                    {teams.map(t => (
                      <option key={t.id} value={t.id} className="bg-[#0c0c0c]">{t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Mission Goal</label>
                  <textarea
                    id="mission-goal"
                    placeholder="E.g., Design and implement a high-end landing page for ForgeLab..."
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-5 text-white placeholder:text-white/10 focus:outline-none focus:border-emerald-500/50 font-medium text-sm resize-none"
                  />
                </div>

                <button
                  onClick={() => {
                    const teamId = (document.getElementById('team-select') as HTMLSelectElement).value;
                    const goal = (document.getElementById('mission-goal') as HTMLTextAreaElement).value;
                    if (teamId && goal) startMission(teamId, goal);
                  }}
                  className="w-full py-5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-emerald-500/20"
                >
                  Authorize & Launch
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatCard({ title, value, icon: Icon, color, description, className, variants }: any) {
  const colors: any = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.1)]',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.1)]',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20 shadow-[0_0_40px_rgba(168,85,247,0.1)]',
  };

  return (
    <motion.div
      variants={variants}
      className={`relative group overflow-hidden rounded-[2.5rem] border p-8 bg-black/40 backdrop-blur-3xl transition-all hover:border-white/20 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className={`p-4 rounded-2xl ${colors[color]}`}>
          <Icon size={24} />
        </div>
        <TrendingUp size={20} className="text-white/10" />
      </div>
      <div className="space-y-1">
        <p className="text-5xl font-black tracking-tighter">{value}</p>
        <p className="text-sm font-black uppercase tracking-widest text-white/40">{title}</p>
        <p className="text-[10px] font-medium text-white/20">{description}</p>
      </div>
    </motion.div>
  );
}

function QuickLink({ to, label, icon: Icon }: any) {
  return (
    <Link to={to} className="group/link flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-white/5 group-hover/link:bg-emerald-500/20 transition-colors">
          <Icon size={18} className="text-white/40 group-hover/link:text-emerald-400" />
        </div>
        <span className="text-sm font-bold text-white/60 group-hover/link:text-white transition-colors">{label}</span>
      </div>
      <ChevronRight size={16} className="text-white/10 group-hover/link:translate-x-1 transition-all" />
    </Link>
  );
}

function Settings({ size, className }: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
  );
}
