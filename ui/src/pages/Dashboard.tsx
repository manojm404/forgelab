import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Bot, CheckCircle2, CircleDashed, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export function Dashboard() {
  const [stats, setStats] = useState({ agents: 0, activeTasks: 0, completedTasks: 0, recentActivity: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get('http://localhost:3001/api/dashboard/stats');
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const container: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <div>
        <motion.h1 variants={item} className="text-4xl font-bold tracking-tight mb-2">
          Welcome back
        </motion.h1>
        <motion.p variants={item} className="text-white/50 text-lg">
          Here's what your agents are working on today.
        </motion.p>
      </div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Agents" 
          value={stats.agents} 
          icon={Bot} 
          trend="synced"
          iconColor="text-emerald-400"
          iconBg="bg-emerald-400/10"
        />
        <StatCard 
          title="Tasks in Progress" 
          value={stats.activeTasks} 
          icon={CircleDashed} 
          trend="active now"
          iconColor="text-blue-400"
          iconBg="bg-blue-400/10"
        />
        <StatCard 
          title="Tasks Completed" 
          value={stats.completedTasks} 
          icon={CheckCircle2} 
          trend="all time"
          iconColor="text-purple-400"
          iconBg="bg-purple-400/10"
        />
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Activity className="text-emerald-400" size={20} />
            Recent Activity
          </h2>
          
          <div className="space-y-4">
            {stats.recentActivity.length === 0 ? (
              <p className="text-white/30 italic text-center py-8">No recent activity found. Head to the Console to run a task!</p>
            ) : (
              stats.recentActivity.map((run: any) => (
                <div key={run.id} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400/20 to-blue-500/20 flex items-center justify-center border border-white/10 shrink-0">
                    <Bot size={20} className="text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium truncate">{run.agent.name}</p>
                      <span className="text-xs text-white/40 flex items-center gap-1">
                        <Clock size={12} /> {new Date(run.startedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-white/60 truncate group-hover:text-white/80 transition-colors">
                      {run.transcripts?.[0]?.content.substring(0, 100) || "Task initialized..."}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6">
           <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
           <div className="space-y-3">
             <Link to="/agents" className="block w-full text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 hover:border-white/10">
               <span className="block font-medium mb-1">Manage Agents</span>
               <span className="block text-sm text-white/50">View, edit, or hire new agents</span>
             </Link>
             <Link to="/console" className="block w-full text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 hover:border-white/10">
               <span className="block font-medium mb-1">Open Console</span>
               <span className="block text-sm text-white/50">Run tasks and monitor real-time output</span>
             </Link>
             <Link to="/settings" className="block w-full text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 hover:border-white/10">
               <span className="block font-medium mb-1">Configure Workspace</span>
               <span className="block text-sm text-white/50">Manage global settings and API keys</span>
             </Link>
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatCard({ title, value, icon: Icon, trend, iconColor, iconBg }: any) {
  return (
    <div className="relative group overflow-hidden rounded-2xl p-[1px]">
      <span className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent group-hover:from-white/20 transition-colors duration-500" />
      <div className="relative h-full bg-black/60 backdrop-blur-xl rounded-2xl p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white/60 font-medium">{title}</h3>
          <div className={`p-2 rounded-lg ${iconBg}`}>
            <Icon size={20} className={iconColor} />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-4xl font-bold">{value}</span>
          <span className="text-sm text-white/40">{trend}</span>
        </div>
      </div>
    </div>
  );
}
