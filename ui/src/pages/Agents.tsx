import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Search, MoreVertical, Play, Edit, Trash, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { HireAgentModal } from '../components/HireAgentModal';

export function Agents() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const { data } = await axios.get('http://localhost:3001/api/agents');
      setAgents(data);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncAgents = async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:3001/api/agents/sync');
      await fetchAgents();
    } catch (error) {
      console.error('Failed to sync agents:', error);
      setLoading(false);
    }
  };

  const filteredAgents = agents.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    (a.role && a.role.toLowerCase().includes(search.toLowerCase()))
  );

  const container: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Agents</h1>
          <p className="text-white/50 text-lg">Manage and monitor your AI workforce.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={syncAgents}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors font-medium flex items-center gap-2"
          >
            Sync from Workspace
          </button>
          <button 
            onClick={() => setIsHireModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-colors font-medium shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            Hire Agent
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={20} />
        <input 
          type="text"
          placeholder="Search agents by name or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all backdrop-blur-xl"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredAgents.map((agent) => (
            <Link key={agent.id} to={`/agents/${agent.id}`}>
              <motion.div 
                variants={item}
                className="group relative overflow-hidden rounded-2xl p-[1px] bg-white/5 hover:bg-white/10 transition-colors cursor-pointer h-full"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative h-full bg-black/60 backdrop-blur-xl rounded-2xl p-6 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400/20 to-blue-500/20 flex items-center justify-center border border-white/10">
                      <Bot size={24} className="text-emerald-400" />
                    </div>
                    <div className={`px-2 py-1 rounded-md text-xs font-medium border ${
                      agent.status === 'idle' ? 'bg-white/5 border-white/10 text-white/70' :
                      agent.status === 'working' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                      'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                      {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-1 truncate">{agent.name}</h3>
                  <p className="text-sm text-emerald-400/80 mb-4 truncate">{agent.role}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-white/5">
                    <div>
                      <p className="text-xs text-white/40 mb-1">Total Tasks</p>
                      <p className="font-semibold">{agent.totalTasks || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/40 mb-1">Model</p>
                      <p className="font-semibold text-sm truncate">{agent.model}</p>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-medium text-emerald-400 flex items-center gap-1">
                      View Details <ChevronRight size={16} />
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
          
          {filteredAgents.length === 0 && (
            <div className="col-span-full py-20 text-center text-white/50">
              No agents found matching your search.
            </div>
          )}
        </motion.div>
      )}

      <HireAgentModal 
        isOpen={isHireModalOpen} 
        onClose={() => setIsHireModalOpen(false)} 
        onSuccess={fetchAgents} 
      />
    </div>
  );
}
