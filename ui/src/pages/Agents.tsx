import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Search, MoreVertical, Play, Edit, Trash, ChevronRight,
  Code, Layout, Target, ShieldCheck, Gamepad2, Megaphone, Brain, Users,
  Sparkles, Filter, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { HireAgentModal } from '../components/HireAgentModal';

const TEAMS = [
  { id: 'all', name: 'All Agents', icon: Users, color: 'emerald' },
  { id: 'engineering', name: 'Engineering', icon: Code, color: 'blue' },
  { id: 'strategy', name: 'Product & Strategy', icon: Target, color: 'purple' },
  { id: 'creative', name: 'Creative & UI/UX', icon: Layout, color: 'pink' },
  { id: 'operations', name: 'Operations & Audit', icon: ShieldCheck, color: 'orange' },
  { id: 'marketing', name: 'Marketing & SEO', icon: Megaphone, color: 'yellow' },
  { id: 'game', name: 'Game & Immersive', icon: Gamepad2, color: 'red' },
  { id: 'ai', name: 'Specialized AI', icon: Brain, color: 'indigo' },
  { id: 'squads', name: 'Featured Squads', icon: Sparkles, color: 'emerald' },
];

const SQUADS = [
  {
    name: 'The Web Squad',
    description: 'Perfect for building modern web applications from scratch.',
    agents: ['Frontend Developer', 'Backend Developer', 'Ui Designer'],
    color: 'from-blue-500/20 to-emerald-500/20',
  },
  {
    name: 'Growth Hackers',
    description: 'Scale your product with SEO, social media, and content.',
    agents: ['Seo Specialist', 'Social Media Strategist', 'Content Creator'],
    color: 'from-yellow-500/20 to-orange-500/20',
  },
  {
    name: 'The Game Studio',
    description: 'Everything you need to build immersive 3D experiences.',
    agents: ['Unity Architect', 'Level Designer', 'Game Audio Engineer'],
    color: 'from-red-500/20 to-purple-500/20',
  },
  {
    name: 'Security & Compliance',
    description: 'Keep your infrastructure safe and your business compliant.',
    agents: ['Security Engineer', 'Compliance Auditor', 'Legal Compliance Checker'],
    color: 'from-indigo-500/20 to-blue-500/20',
  }
];

export function Agents() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTeam, setActiveTeam] = useState('all');
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const { data } = await axios.get('http://localhost:3001/api/agents');
      setAgents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch agents, using mock data:', error);
      setAgents([
        { id: '1', name: 'Software Architect', role: 'System Design', status: 'idle', model: 'gemini-1.5-pro' },
        { id: '2', name: 'UI Designer', role: 'Interface Design', status: 'idle', model: 'gemini-1.5-flash' },
        { id: '3', name: 'Backend Developer', role: 'API Development', status: 'idle', model: 'gemini-1.5-flash' },
      ]);
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
      alert('Sync failed. Please check backend logs.');
      setLoading(false);
    }
  };

  const getAgentTeam = (name: string) => {
    if (!name) return 'operations';
    const n = name.toLowerCase();
    if (n.includes('arch') || n.includes('engineer') || n.includes('dev') || n.includes('sre') || n.includes('code')) return 'engineering';
    if (n.includes('strat') || n.includes('manager') || n.includes('lead') || n.includes('project') || n.includes('product') || n.includes('deal')) return 'strategy';
    if (n.includes('des') || n.includes('artist') || n.includes('creative') || n.includes('content') || n.includes('storyteller')) return 'creative';
    if (n.includes('audit') || n.includes('security') || n.includes('test') || n.includes('compliance') || n.includes('legal') || n.includes('finance')) return 'operations';
    if (n.includes('market') || n.includes('seo') || n.includes('social') || n.includes('ad') || n.includes('trend') || n.includes('growth')) return 'marketing';
    if (n.includes('unity') || n.includes('unreal') || n.includes('godot') || n.includes('roblox') || n.includes('xr') || n.includes('game') || n.includes('visionos')) return 'game';
    if (n.includes('prompt') || n.includes('qa') || n.includes('experiment') || n.includes('brain') || n.includes('identity')) return 'ai';
    return 'operations'; // Default
  };

  const getAgentSpecialty = (name: string) => {
    if (!name) return 'Autonomous AI Agent';
    const n = name.toLowerCase();
    if (n.includes('arch') || n.includes('engineer') || n.includes('dev') || n.includes('sre')) return 'Engineering & Infrastructure';
    if (n.includes('strat') || n.includes('manager') || n.includes('lead') || n.includes('project')) return 'Strategy & Planning';
    if (n.includes('des') || n.includes('artist') || n.includes('creative')) return 'Creative & UI/UX';
    if (n.includes('spec') || n.includes('expert') || n.includes('steward')) return 'Specialized Operations';
    if (n.includes('audit') || n.includes('security') || n.includes('test')) return 'Quality & Security';
    if (n.includes('res') || n.includes('anlyst') || n.includes('data')) return 'Research & Data Science';
    if (n.includes('market') || n.includes('seo') || n.includes('social')) return 'Marketing & Growth';
    return 'Autonomous AI Agent';
  };

  const hireSquad = async (squad: any) => {
    try {
      setLoading(true);
      for (const agentName of squad.agents) {
        const existing = agents.find(a => a.name && a.name.toLowerCase() === agentName.toLowerCase());
        if (!existing) {
          await axios.post('http://localhost:3001/api/agents', {
            name: agentName,
            role: `Member of ${squad.name}`,
            model: 'gemini-1.5-flash'
          });
        }
      }
      await axios.post('http://localhost:3001/api/teams', {
        name: squad.name,
        description: squad.description
      });
      alert(`${squad.name} has been deployed!`);
      await fetchAgents();
    } catch (error) {
      console.error('Failed to hire squad:', error);
      alert('Failed to deploy squad.');
    } finally {
      setLoading(false);
    }
  };

  const filteredAgents = (agents || []).filter(a => {
    if (!a) return false;
    const name = a.name || '';
    const role = a.role || '';
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) ||
                         role.toLowerCase().includes(search.toLowerCase());
    const matchesTeam = activeTeam === 'all' || getAgentTeam(name) === activeTeam;
    return matchesSearch && matchesTeam;
  });

  return (
    <div className="space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <Sparkles size={18} />
            <span className="text-sm font-bold uppercase tracking-widest">Marketplace</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-2 bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
            Hire Your Team
          </h1>
          <p className="text-white/50 text-xl max-w-2xl">
            Browse specialized agents and build a multi-agent workforce.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={syncAgents}
            className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-bold flex items-center gap-2 text-sm"
          >
            Sync Workspace
          </button>
          <button
            onClick={() => setIsHireModalOpen(true)}
            className="px-8 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all font-black shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:-translate-y-1"
          >
            Hire Agent
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Sidebar: Teams */}
        <div className="lg:col-span-3 space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-emerald-400 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search talent..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-all backdrop-blur-xl"
              />
            </div>

            <div className="bg-black/40 border border-white/10 rounded-3xl p-4 backdrop-blur-xl">
              <div className="flex items-center gap-2 px-4 mb-4 text-white/40 font-bold text-xs uppercase tracking-widest">
                <Filter size={14} />
                Expert Teams
              </div>
              <div className="space-y-1">
                {TEAMS.map((team) => {
                  const Icon = team.icon;
                  const isActive = activeTeam === team.id;
                  const colorMap: any = {
                    emerald: 'text-emerald-400 bg-emerald-500/10',
                    blue: 'text-blue-400 bg-blue-500/10',
                    purple: 'text-purple-400 bg-purple-500/10',
                    pink: 'text-pink-400 bg-pink-500/10',
                    orange: 'text-orange-400 bg-orange-500/10',
                    yellow: 'text-yellow-400 bg-yellow-500/10',
                    red: 'text-red-400 bg-red-500/10',
                    indigo: 'text-indigo-400 bg-indigo-500/10',
                  };

                  return (
                    <button
                      key={team.id}
                      onClick={() => setActiveTeam(team.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                        isActive
                          ? `${colorMap[team.color]} font-bold`
                          : 'text-white/50 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-white/10' : 'bg-transparent group-hover:bg-white/10'}`}>
                        <Icon size={18} />
                      </div>
                      <span className="text-sm">{team.name}</span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-current" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Content: Agent Grid */}
        <div className="lg:col-span-9">
          {loading ? (
            <div className="flex items-center justify-center py-40">
              <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
            </div>
          ) : activeTeam === 'squads' ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {SQUADS.map((squad) => (
                  <div
                    key={squad.name}
                    className="group relative bg-black/40 border border-white/10 rounded-3xl p-8 overflow-hidden"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${squad.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <div className="relative z-10">
                      <h3 className="text-2xl font-black text-white mb-2">{squad.name}</h3>
                      <p className="text-white/50 mb-6">{squad.description}</p>
                      <button
                        onClick={() => hireSquad(squad)}
                        className="mt-8 w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black transition-all flex items-center justify-center gap-2 shadow-xl"
                      >
                        Hire Full Squad <Sparkles size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  {TEAMS.find(t => t.id === activeTeam)?.name || 'Agents'}
                  <span className="text-white/20 text-sm font-mono">[{filteredAgents.length}]</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAgents.map((agent) => {
                  const name = agent.name || 'Unknown Agent';
                  const teamId = getAgentTeam(name);
                  const styleMap: any = {
                    engineering: { bg: 'from-blue-500/20 to-indigo-500/20', text: 'text-blue-400' },
                    strategy: { bg: 'from-purple-500/20 to-pink-500/20', text: 'text-purple-400' },
                    creative: { bg: 'from-pink-500/20 to-red-500/20', text: 'text-pink-400' },
                    operations: { bg: 'from-orange-500/20 to-yellow-500/20', text: 'text-orange-400' },
                    marketing: { bg: 'from-yellow-500/20 to-orange-500/20', text: 'text-yellow-400' },
                    game: { bg: 'from-red-500/20 to-orange-500/20', text: 'text-red-400' },
                    ai: { bg: 'from-indigo-500/20 to-purple-500/20', text: 'text-indigo-400' },
                  };
                  const style = styleMap[teamId] || { bg: 'from-emerald-500/10 to-blue-500/10', text: 'text-emerald-400' };

                  return (
                    <div key={agent.id} className="group relative">
                      <div className="relative h-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 transition-all group-hover:border-white/30 group-hover:-translate-y-1 shadow-xl overflow-hidden">
                        <Link to={`/agents/${agent.id}`} className="absolute inset-0 z-0" />
                        <div className={`absolute inset-0 bg-gradient-to-br ${style.bg} opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none`} />
                        <div className="relative z-10 space-y-4 pointer-events-none">
                          <div className="flex items-start justify-between">
                            <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${style.text}`}>
                              <Bot size={28} />
                            </div>
                            <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 bg-white/5 text-white/40">
                              {agent.status || 'idle'}
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-white group-hover:text-emerald-400 transition-colors truncate">{name}</h3>
                            <p className="text-xs text-white/30 font-bold uppercase tracking-wider mt-1">{getAgentSpecialty(name)}</p>
                          </div>
                          <div className="pt-4 border-t border-white/5 flex items-center justify-between pointer-events-auto">
                            <Link to={`/console?agentId=${agent.id}`} className="text-[10px] font-black text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg relative z-20">
                              DIRECT LINK <Zap size={10} fill="currentColor" />
                            </Link>
                            <Link to={`/agents/${agent.id}`} className="text-xs font-black text-white/20 group-hover:text-white transition-colors flex items-center gap-1 relative z-20">
                              HIRE <ChevronRight size={14} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <HireAgentModal
        isOpen={isHireModalOpen}
        onClose={() => setIsHireModalOpen(false)}
        onSuccess={fetchAgents}
      />
    </div>
  );
}
