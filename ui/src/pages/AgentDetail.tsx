import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Bot, Save, Activity, Clock, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

export function AgentDetail() {
  const { id } = useParams();
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    identity: '',
    soul: '',
    role: '',
    model: ''
  });

  useEffect(() => {
    fetchAgent();
  }, [id]);

  const fetchAgent = async () => {
    try {
      const { data } = await axios.get(`http://localhost:3001/api/agents/${id}`);
      setAgent(data);
      setFormData({
        identity: data.identity || '',
        soul: data.soul || '',
        role: data.role || '',
        model: data.model || 'gemini-1.5-flash'
      });
    } catch (error) {
      console.error('Failed to fetch agent:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`http://localhost:3001/api/agents/${id}`, formData);
      await fetchAgent();
      alert('Agent updated successfully!');
    } catch (error) {
      console.error('Failed to update agent:', error);
      alert('Failed to update agent.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!agent) {
    return <div className="text-white/50 text-center py-20">Agent not found.</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/agents" className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/50 hover:text-white">
            <ArrowLeft size={24} />
          </Link>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400/20 to-blue-500/20 flex items-center justify-center border border-white/10">
            <Bot size={24} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{agent.name}</h1>
            <p className="text-white/50">{agent.role}</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl font-medium bg-emerald-500 hover:bg-emerald-600 text-white transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50"
        >
          {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <SettingsIcon /> Configuration
            </h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Role</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Model</label>
                <select
                  value={formData.model}
                  onChange={e => setFormData({ ...formData, model: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white appearance-none focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="gemini-1.5-flash" className="bg-gray-900">Gemini 1.5 Flash</option>
                  <option value="gemini-1.5-pro" className="bg-gray-900">Gemini 1.5 Pro</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">IDENTITY.md</label>
              <textarea
                value={formData.identity}
                onChange={e => setFormData({ ...formData, identity: e.target.value })}
                className="w-full h-48 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-emerald-500/50 font-mono text-sm resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">SOUL.md</label>
              <textarea
                value={formData.soul}
                onChange={e => setFormData({ ...formData, soul: e.target.value })}
                className="w-full h-48 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-emerald-500/50 font-mono text-sm resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Stats & History */}
        <div className="space-y-6">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Activity className="text-blue-400" size={20} />
              Agent Stats
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                <span className="text-white/50">Status</span>
                <span className="text-emerald-400 font-medium">{agent.status}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                <span className="text-white/50">Total Tasks</span>
                <span className="text-white font-medium">{agent.totalTasks}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                <span className="text-white/50">Created</span>
                <span className="text-white font-medium">{new Date(agent.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Clock className="text-purple-400" size={20} />
              Recent Runs
            </h2>
            <div className="space-y-3">
              {agent.runs?.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-4">No runs yet.</p>
              ) : (
                agent.runs?.slice(0, 5).map((run: any) => (
                  <div key={run.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/40">{new Date(run.startedAt).toLocaleString()}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-md ${
                        run.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                        run.status === 'running' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {run.status}
                      </span>
                    </div>
                    <span className="text-sm text-white/80 truncate">Task ID: {run.taskId.split('-')[0]}...</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

function SettingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
  );
}
