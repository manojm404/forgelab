import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bot, Save } from 'lucide-react';
import axios from 'axios';

interface HireAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function HireAgentModal({ isOpen, onClose, onSuccess }: HireAgentModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    model: 'gemini-1.5-flash',
    identity: '',
    soul: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:3001/api/agents', formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to hire agent:', error);
      alert('Failed to hire agent. Make sure the name is unique.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-[#0c0c0c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400/20 to-blue-500/20 flex items-center justify-center border border-white/10">
                  <Bot size={20} className="text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Hire New Agent</h2>
                  <p className="text-sm text-white/50">Create a new specialized AI worker</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Agent Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., code-reviewer"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Role</label>
                  <input
                    required
                    type="text"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g., Senior Code Reviewer"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Model</label>
                <select
                  value={formData.model}
                  onChange={e => setFormData({ ...formData, model: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Initial Instructions (IDENTITY.md)</label>
                <textarea
                  value={formData.identity}
                  onChange={e => setFormData({ ...formData, identity: e.target.value })}
                  placeholder="Leave blank for default. This defines who the agent is."
                  className="w-full h-24 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 font-mono text-sm resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl font-medium bg-emerald-500 hover:bg-emerald-600 text-white transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50"
                >
                  {loading ? 'Hiring...' : <><Save size={18} /> Hire Agent</>}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
