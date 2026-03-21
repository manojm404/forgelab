import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, X, Users, Play, Clock, AlertCircle, ShieldCheck, ListChecks, User,
  MessageSquare, Brain, Zap, Activity, GitBranch, Lock, Unlock,
  ChevronRight, Sparkles, Send, Bot, Terminal, Globe
} from 'lucide-react';
import axios from 'axios';
import { useWebSocket } from '../hooks/useWebSocket';
import { ConnectionStatusBadge } from '../components/ConnectionStatusIndicator';

interface BlackboardMessage {
  id: string;
  agentId: string;
  agentName: string;
  content: string;
  type: 'proposal' | 'review' | 'handoff' | 'decision';
  timestamp: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  agentId: string;
  agentName?: string;
  parentTaskId?: string | null;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: string;
  emoji?: string;
  avatar?: string;
}

export function TeamDashboard() {
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [approvalRequest, setApprovalRequest] = useState<any>(null);
  const [localBlackboard, setLocalBlackboard] = useState<BlackboardMessage[]>([]);

  // WebSocket connection
  const {
    status,
    blackboardMessages: liveMessages,
    sendMessage,
    isConnected,
    detectedUrl,
    connect
  } = useWebSocket({
    onMessage: (message) => {
      if (message.type === 'task:update') {
        fetchTeam();
      }
      if (message.type === 'human:approval_required') {
        setApprovalRequest(message.payload);
        fetchTeam();
      }
      if (message.type === 'blackboard:message') {
        setLocalBlackboard(prev => [...prev, message.payload].slice(-50));
      }
    }
  });

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('http://localhost:3001/api/teams/current');
      setTeam(data);
      if (data?.blackboard?.messages) {
        setLocalBlackboard(JSON.parse(data.blackboard.messages));
      }
    } catch (error) {
      console.warn("Failed to fetch team data, enabling mock mode", error);
      // Mock Data for Demo
      setTeam({
        name: 'Web Innovation Squad',
        members: [
          { id: '1', agent: { name: 'Software Architect', status: 'active', emoji: '🏗️' }, role: 'lead' },
          { id: '2', agent: { name: 'UI Designer', status: 'idle', emoji: '🎨' }, role: 'designer' },
        ],
        tasks: [
          { id: 't1', title: 'Project Decomposition', description: 'Break down landing page into tasks.', status: 'completed' },
          { id: 't2', title: 'Design Mockup', description: 'Create high-fidelity Figma designs.', status: 'waiting-for-approval' }
        ]
      });
      setLocalBlackboard([
        { id: 'm1', agentName: 'Software Architect', content: 'Initializing mission parameters...', type: 'proposal', timestamp: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const approveTask = async (taskId: string) => {
    console.log('Approving task:', taskId);
    try {
      if (status === 'connected') {
        await axios.post(`http://localhost:3001/api/tasks/${taskId}/approve`);
        sendMessage('task:approved', { taskId, status: 'approved' });
      } else {
        // Mock success for demo if disconnected
        setTeam((prev: any) => ({
          ...prev,
          tasks: prev.tasks.map((t: any) => t.id === taskId ? { ...t, status: 'approved' } : t)
        }));
      }
      await fetchTeam();
    } catch (error) {
      console.error("Failed to approve task", error);
    }
  };

  const rejectTask = async (taskId: string) => {
    try {
      if (status === 'connected') {
        await axios.post(`http://localhost:3001/api/tasks/${taskId}/reject`);
        sendMessage('task:rejected', { taskId, status: 'rejected' });
      } else {
        setTeam((prev: any) => ({
          ...prev,
          tasks: prev.tasks.map((t: any) => t.id === taskId ? { ...t, status: 'rejected' } : t)
        }));
      }
      await fetchTeam();
    } catch (error) {
      console.error("Failed to reject task", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="w-12 h-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // Group tasks by parent
  const rootTasks = team?.tasks?.filter((t: Task) => !t.parentTaskId) || [];
  const getSubTasks = (parentId: string) => team?.tasks?.filter((t: Task) => t.parentTaskId === parentId) || [];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
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
      className="space-y-10"
    >
      {/* Approval Overlay */}
      <AnimatePresence>
        {approvalRequest && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setApprovalRequest(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#0c0c0c] border border-orange-500/30 rounded-[2.5rem] p-10 shadow-[0_0_100px_rgba(249,115,22,0.1)] overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500" />
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                  <ShieldCheck size={28} className="text-orange-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Human Gate</h2>
                  <p className="text-xs text-white/30 font-bold uppercase tracking-widest mt-1">Approval Required from Root</p>
                </div>
              </div>

              <div className="space-y-6 mb-10">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-3">
                  <div className="flex items-center gap-2 text-orange-400 font-black text-[10px] uppercase tracking-widest">
                    <Bot size={12} /> {approvalRequest.agentName || 'Agent'} Requests Signal
                  </div>
                  <p className="text-lg font-medium text-white/80 leading-relaxed italic">
                    "{approvalRequest.reason}"
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    approveTask(approvalRequest.taskId);
                    setApprovalRequest(null);
                  }}
                  className="py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-emerald-500/20"
                >
                  Confirm Signal
                </button>
                <button
                  onClick={() => {
                    rejectTask(approvalRequest.taskId);
                    setApprovalRequest(null);
                  }}
                  className="py-4 rounded-2xl bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 font-black uppercase tracking-widest text-xs transition-all border border-white/5"
                >
                  Abort Task
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div variants={item} className="space-y-2">
          <div className="flex items-center gap-2 text-purple-400 font-black uppercase tracking-[0.2em] text-xs">
            <Users size={14} />
            Mission Control
          </div>
          <h1 className="text-6xl font-black tracking-tighter leading-none">
            COLLAB <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">ENGINE.</span>
          </h1>
        </motion.div>
        
        <motion.div variants={item} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-[2rem] p-3 backdrop-blur-xl">
           <ConnectionStatusBadge
            status={status}
            detectedUrl={detectedUrl}
            onReconnect={connect}
          />
          <div className="h-4 w-[1px] bg-white/10 mx-2" />
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-black uppercase tracking-widest">
            <Globe size={12} />
            Cluster: 01
          </div>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          label="Active Workforce"
          value={team?.members?.length || 0}
          color="purple"
          variants={item}
        />
        <StatCard
          icon={ListChecks}
          label="Manifest Tasks"
          value={team?.tasks?.length || 0}
          color="blue"
          variants={item}
        />
        <StatCard
          icon={Clock}
          label="Pending Gate"
          value={team?.tasks?.filter((t: any) => t.status === 'waiting-for-approval').length || 0}
          color="orange"
          variants={item}
        />
        <StatCard
          icon={MessageSquare}
          label="Neural Packets"
          value={localBlackboard.length}
          color="emerald"
          variants={item}
        />
      </div>

      {/* Main Mission Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: Workforce & Blackboard */}
        <div className="lg:col-span-8 space-y-8">

          {/* Blackboard */}
          <motion.section
            variants={item}
            className="bg-black/40 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-3xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Brain size={160} className="text-purple-400" />
            </div>

            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h2 className="text-2xl font-black flex items-center gap-3">
                  Neural Blackboard <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                </h2>
                <p className="text-white/30 text-sm font-medium uppercase tracking-widest">Shared Agent Intelligence Feed</p>
              </div>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
              <AnimatePresence mode="popLayout">
                {localBlackboard.length === 0 ? (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
                      <MessageSquare size={32} className="text-white/10" />
                    </div>
                    <p className="text-white/20 font-bold uppercase tracking-widest text-xs">Awaiting neural handshake...</p>
                  </div>
                ) : (
                  localBlackboard.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`p-6 rounded-[2rem] border relative overflow-hidden group/msg transition-all hover:scale-[1.01] ${
                        msg.type === 'proposal' ? 'bg-blue-500/5 border-blue-500/10' :
                        msg.type === 'review' ? 'bg-orange-500/5 border-orange-500/10' :
                        msg.type === 'decision' ? 'bg-emerald-500/5 border-emerald-500/10' :
                        'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                            <Bot size={16} className="text-white/40" />
                          </div>
                          <div>
                            <span className="text-sm font-black uppercase tracking-wider text-white/80">{msg.agentName}</span>
                            <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mt-0.5">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          msg.type === 'proposal' ? 'text-blue-400 border-blue-400/20 bg-blue-400/10' :
                          msg.type === 'review' ? 'text-orange-400 border-orange-400/20 bg-orange-400/10' :
                          msg.type === 'decision' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10' :
                          'text-white/40 border-white/10 bg-white/5'
                        }`}>
                          {msg.type}
                        </div>
                      </div>
                      <p className="text-sm text-white/60 leading-relaxed font-medium pl-11">{msg.content}</p>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.section>

          {/* Workforce Grid */}
          <motion.section variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {team?.members?.map((member: any) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-5 rounded-[2rem] bg-black/40 border border-white/10 hover:border-purple-500/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                    {member.agent?.emoji ? (
                      <span className="text-2xl">{member.agent.emoji}</span>
                    ) : (
                      <User size={20} className="text-purple-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-black text-sm uppercase tracking-wider text-white/90">{member.agent?.name || 'Unknown Agent'}</div>
                    <div className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-0.5">{member.role}</div>
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                  member.agent?.status === 'active' || member.agent?.status === 'working'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 animate-pulse'
                    : 'bg-white/5 border-white/10 text-white/20'
                }`}>
                  {member.agent?.status || 'idle'}
                </div>
              </div>
            ))}
          </motion.section>
        </div>

        {/* Right: Task Manifest */}
        <div className="lg:col-span-4 space-y-8">
          <motion.section 
            variants={item}
            className="bg-black/40 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-3xl h-full relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <ListChecks size={140} className="text-blue-400" />
            </div>

            <div className="space-y-1 mb-8">
              <h2 className="text-2xl font-black flex items-center gap-3">
                Task Manifest <Sparkles size={20} className="text-blue-400" />
              </h2>
              <p className="text-white/30 text-sm font-medium uppercase tracking-widest">Active Operations</p>
            </div>

            <div className="space-y-6">
              {rootTasks.map((task: Task) => (
                <div key={task.id} className="space-y-3">
                  <TaskCard
                    task={task}
                    approveTask={approveTask}
                    rejectTask={rejectTask}
                    isRoot={true}
                  />
                  {getSubTasks(task.id).length > 0 && (
                    <div className="ml-8 space-y-3 border-l-2 border-white/5 pl-6 relative">
                      <div className="absolute top-0 left-0 w-4 h-[2px] bg-white/5 -translate-y-1/2" />
                      {getSubTasks(task.id).map((subTask: Task) => (
                        <TaskCard
                          key={subTask.id}
                          task={subTask}
                          approveTask={approveTask}
                          rejectTask={rejectTask}
                          isRoot={false}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {(!team?.tasks || team.tasks.length === 0) && (
                <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
                    <Terminal size={32} className="text-white/10" />
                  </div>
                  <p className="text-white/20 font-bold uppercase tracking-widest text-xs">No active operations</p>
                </div>
              )}
            </div>
          </motion.section>
        </div>
      </div>
    </motion.div>
  );
}

function TaskCard({ task, approveTask, rejectTask, isRoot }: any) {
  return (
    <div
      className={`p-6 rounded-[2rem] border transition-all hover:scale-[1.02] ${
        task.status === 'waiting-for-approval'
          ? 'bg-orange-500/10 border-orange-500/30'
          : isRoot ? 'bg-white/5 border-white/10' : 'bg-white/[0.02] border-white/5'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 pr-4">
          <div className="font-black text-sm uppercase tracking-wider text-white mb-1 truncate">{task.title}</div>
          <div className="text-xs text-white/40 font-medium line-clamp-2 leading-relaxed">{task.description}</div>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shrink-0 ${
          task.status === 'waiting-for-approval' ? 'border-orange-500/50 text-orange-400 animate-pulse' :
          task.status === 'completed' ? 'border-emerald-500/50 text-emerald-400' :
          'border-blue-500/50 text-blue-400'
        }`}>
          {task.status}
        </div>
      </div>

      {task.status === 'waiting-for-approval' && (
        <div className="flex gap-2 pt-4 border-t border-white/10">
          <button
            onClick={() => approveTask(task.id)}
            className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <Check size={14} />
            Approve
          </button>
          <button
            onClick={() => rejectTask(task.id)}
            className="flex-1 py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
          >
            <X size={14} />
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, variants }: any) {
  const colors: any = {
    purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/20 text-purple-400',
    blue: 'from-blue-500/20 to-indigo-500/20 border-blue-500/20 text-blue-400',
    orange: 'from-orange-500/20 to-red-500/20 border-orange-500/20 text-orange-400',
    emerald: 'from-emerald-500/20 to-blue-500/20 border-emerald-500/20 text-emerald-400',
  };

  return (
    <motion.div
      variants={variants}
      className={`bg-black/40 border rounded-[2.5rem] p-8 backdrop-blur-3xl relative overflow-hidden group hover:border-white/20 transition-all`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${colors[color]} opacity-0 group-hover:opacity-100 transition-opacity`} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 group-hover:text-white/60 transition-colors">{label}</p>
          <Icon size={20} className={colors[color].split(' ').pop()} />
        </div>
        <p className="text-4xl font-black tracking-tighter">{value}</p>
      </div>
    </motion.div>
  );
}
