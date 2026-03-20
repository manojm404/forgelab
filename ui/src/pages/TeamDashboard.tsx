import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, X, Users, Play, Clock, AlertCircle, ShieldCheck, ListChecks, User,
  MessageSquare, Brain, Zap, Activity, GitBranch, Lock, Unlock
} from 'lucide-react';
import axios from 'axios';
import { useWebSocket, ConnectionStatus } from '../hooks/useWebSocket';
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
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: string;
  emoji?: string;  // Agent emoji from agent.yaml
  avatar?: string; // Agent avatar from agent.yaml
}

export function TeamDashboard() {
  const [team, setTeam] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  // WebSocket connection
  const { 
    status, 
    connectionLabel,
    blackboardMessages, 
    sendMessage,
    isConnected,
    isConnecting,
    isError,
    detectedUrl,
    connect 
  } = useWebSocket({
    onMessage: (message) => {
      console.log('[Dashboard] Received message:', message);
      // Auto-refresh team data on task updates
      if (message.type === 'task:update' || message.type === 'human:approval_required') {
        fetchTeam();
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
    } catch (error) {
      console.error("Failed to fetch team data", error);
    } finally {
      setLoading(false);
    }
  };

  const approveTask = async (taskId: string) => {
    // Optimistic update
    const originalTeam = team;
    setTeam((prev: any) => ({
      ...prev,
      tasks: prev.tasks.map((t: any) => 
        t.id === taskId ? { ...t, status: 'in-progress' } : t
      )
    }));

    try {
      await axios.post(`http://localhost:3001/api/tasks/${taskId}/approve`);
      // Send WebSocket message for real-time update to other clients
      sendMessage('task:approved', { taskId, status: 'approved' });
      await fetchTeam();
    } catch (error) {
      console.error("Failed to approve task", error);
      // Rollback on error
      setTeam(originalTeam);
    }
  };

  const rejectTask = async (taskId: string) => {
    // Optimistic update
    const originalTeam = team;
    setTeam((prev: any) => ({
      ...prev,
      tasks: prev.tasks.map((t: any) => 
        t.id === taskId ? { ...t, status: 'rejected' } : t
      )
    }));

    try {
      await axios.post(`http://localhost:3001/api/tasks/${taskId}/reject`);
      sendMessage('task:rejected', { taskId, status: 'rejected' });
      await fetchTeam();
    } catch (error) {
      console.error("Failed to reject task", error);
      setTeam(originalTeam);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-white/50">Loading team dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Connection Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Team Dashboard
          </h1>
          <p className="text-white/50 mt-1">
            Manage multi-agent collaboration and approvals
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Connection Status Indicator - Subtle bottom corner placement */}
          <ConnectionStatusBadge 
            status={status} 
            detectedUrl={detectedUrl}
            onReconnect={connect} 
          />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          icon={Users} 
          label="Active Agents" 
          value={team?.members?.length || 0}
          color="emerald"
          live={isConnected}
        />
        <StatCard 
          icon={ListChecks} 
          label="Total Tasks" 
          value={team?.tasks?.length || 0}
          color="blue"
          live={isConnected}
        />
        <StatCard 
          icon={Clock} 
          label="Pending Approval" 
          value={team?.tasks?.filter((t: any) => t.status === 'waiting-for-approval').length || 0}
          color="yellow"
          live={isConnected}
        />
        <StatCard 
          icon={MessageSquare} 
          label="Blackboard Messages" 
          value={blackboardMessages.length}
          color="purple"
          live={isConnected}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column */}
        <div className="space-y-6">
          
          {/* Team Members */}
          <section className="bg-black/40 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users size={20} className="text-emerald-400" />
                Active Agents
              </h2>
              {isConnected && (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              )}
            </div>
            <div className="space-y-3">
              {team?.members?.map((member: TeamMember) => (
                <div 
                  key={member.id} 
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400/20 to-blue-500/20 flex items-center justify-center border border-white/10">
                      {member.emoji ? (
                        <span className="text-xl">{member.emoji}</span>
                      ) : member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="w-6 h-6 rounded-full" />
                      ) : (
                        <User size={18} className="text-emerald-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-xs text-white/50">{member.role}</div>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-md text-xs border ${
                    member.status === 'active' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-white/5 border-white/10 text-white/50'
                  }`}>
                    {member.status || 'idle'}
                  </div>
                </div>
              ))}
              {(!team?.members || team.members.length === 0) && (
                <div className="text-center py-8 text-white/50">
                  <Users size={40} className="mx-auto mb-2 opacity-50" />
                  <p>No active agents</p>
                </div>
              )}
            </div>
          </section>

          {/* Blackboard / Agent Communication */}
          <section className="bg-black/40 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Brain size={20} className="text-purple-400" />
                Blackboard - Agent Communication
              </h2>
              {isConnected && (
                <span className="text-xs text-purple-400 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  Real-time
                </span>
              )}
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {blackboardMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-4 rounded-xl border ${
                      msg.type === 'proposal' ? 'bg-blue-500/10 border-blue-500/20' :
                      msg.type === 'review' ? 'bg-yellow-500/10 border-yellow-500/20' :
                      msg.type === 'decision' ? 'bg-emerald-500/10 border-emerald-500/20' :
                      'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare size={14} className="text-white/50" />
                        <span className="text-sm font-medium">{msg.agentName}</span>
                      </div>
                      <span className="text-xs text-white/40">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-white/70">{msg.content}</p>
                    <div className="mt-2 flex gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        msg.type === 'proposal' ? 'bg-blue-500/20 text-blue-400' :
                        msg.type === 'review' ? 'bg-yellow-500/20 text-yellow-400' :
                        msg.type === 'decision' ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-white/10 text-white/50'
                      }`}>
                        {msg.type}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {blackboardMessages.length === 0 && (
                <div className="text-center py-8 text-white/50">
                  <MessageSquare size={40} className="mx-auto mb-2 opacity-50" />
                  <p>Waiting for agent messages...</p>
                  {!isConnected && (
                    <p className="text-xs mt-2 text-yellow-500">
                      ⚠️ Not connected - messages won't appear until reconnected
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Tasks / Manifest */}
          <section className="bg-black/40 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ListChecks size={20} className="text-blue-400" />
                Manifest Tasks
              </h2>
              {isConnected && (
                <span className="text-xs text-blue-400 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  Live
                </span>
              )}
            </div>
            <div className="space-y-3">
              {team?.tasks.map((task: Task) => (
                <div 
                  key={task.id}
                  className={`p-4 rounded-xl border transition-colors ${
                    task.status === 'waiting-for-approval' 
                      ? 'bg-yellow-500/10 border-yellow-500/20' 
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="font-medium mb-1">{task.title}</div>
                      <div className="text-sm text-white/50">{task.description}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs border ${
                      task.status === 'waiting-for-approval' 
                        ? 'border-yellow-500/50 text-yellow-500' 
                        : task.status === 'completed'
                        ? 'border-emerald-500/50 text-emerald-500'
                        : 'border-blue-500/50 text-blue-500'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  
                  {task.status === 'waiting-for-approval' && (
                    <div className="flex gap-2 pt-3 border-t border-white/10">
                      <button 
                        onClick={() => approveTask(task.id)} 
                        className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors flex items-center justify-center gap-2"
                      >
                        <Check size={16} />
                        Approve
                      </button>
                      <button 
                        onClick={() => rejectTask(task.id)}
                        className="flex-1 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors flex items-center justify-center gap-2"
                      >
                        <X size={16} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {(!team?.tasks || team.tasks.length === 0) && (
                <div className="text-center py-8 text-white/50">
                  <ListChecks size={40} className="mx-auto mb-2 opacity-50" />
                  <p>No tasks found</p>
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

// Stat Card Component with live indicator
function StatCard({ icon: Icon, label, value, color, live = false }: any) {
  const colorClasses = {
    emerald: 'from-emerald-400/20 to-emerald-500/20 border-emerald-500/20 text-emerald-400',
    blue: 'from-blue-400/20 to-blue-500/20 border-blue-500/20 text-blue-400',
    yellow: 'from-yellow-400/20 to-yellow-500/20 border-yellow-500/20 text-yellow-400',
    purple: 'from-purple-400/20 to-purple-500/20 border-purple-500/20 text-purple-400',
  };

  return (
    <motion.div 
      className={`bg-black/40 border rounded-2xl p-4 ${colorClasses[color as keyof typeof colorClasses]}`}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-white/50 mb-1">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="flex items-center gap-2">
          {live && (
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          )}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center border border-white/10">
            <Icon size={20} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
