import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bot, Save, Sparkles, Terminal, Shield, Cpu, ChevronRight } from 'lucide-react';
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40, rotateX: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="relative w-full max-w-2xl bg-[#0c0c0c] border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(16,185,129,0.1)] overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 opacity-50" />
            
            <div className="flex items-center justify-between p-8 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <Bot size={24} className="text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white flex items-center gap-2">
                    Hire New Talent <Sparkles size={18} className="text-emerald-400" />
                  </h2>
                  <p className="text-xs text-white/30 font-bold uppercase tracking-widest mt-1">Deploy a specialized AI worker</p>
                </div>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl transition-all text-white/20 hover:text-white active:scale-90">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 group/input">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 group-focus-within/input:text-emerald-400 transition-colors ml-1">Agent Name</label>
                  <div className="relative">
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., code-reviewer"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/10 focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                    />
                    <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-emerald-400 transition-colors" size={18} />
                  </div>
                </div>
                <div className="space-y-3 group/input">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 group-focus-within/input:text-emerald-400 transition-colors ml-1">Primary Role</label>
                  <div className="relative">
                    <input
                      required
                      type="text"
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                      placeholder="e.g., Senior Developer"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/10 focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                    />
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-emerald-400 transition-colors" size={18} />
                  </div>
                </div>
              </div>

              <div className="space-y-3 group/input">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 group-focus-within/input:text-emerald-400 transition-colors ml-1">Neural Model</label>
                <div className="relative">
                  <select
                    value={formData.model}
                    onChange={e => setFormData({ ...formData, model: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white appearance-none focus:outline-none focus:border-emerald-500/50 transition-all font-bold text-sm tracking-wide"
                  >
                    <option value="gemini-1.5-flash" className="bg-[#0c0c0c]">Gemini 1.5 Flash (Fast)</option>
                    <option value="gemini-1.5-pro" className="bg-[#0c0c0c]">Gemini 1.5 Pro (Reasoning)</option>
                    <option value="gemini-2.0-flash" className="bg-[#0c0c0c]">Gemini 2.0 Flash (Next-Gen)</option>
                  </select>
                  <Cpu className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-emerald-400 transition-colors pointer-events-none" size={18} />
                </div>
              </div>

              <div className="space-y-3 group/input">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 group-focus-within/input:text-emerald-400 transition-colors ml-1">Identity Blueprint (IDENTITY.md)</label>
                <textarea
                  value={formData.identity}
                  onChange={e => setFormData({ ...formData, identity: e.target.value })}
                  placeholder="Define the agent's personality and boundaries..."
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-5 text-white placeholder:text-white/10 focus:outline-none focus:border-emerald-500/50 transition-all font-medium text-sm resize-none leading-relaxed"
                />
              </div>

              <div className="pt-6 flex justify-end gap-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white/30 hover:text-white hover:bg-white/5 transition-all"
                >
                  Abort
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="relative group/btn overflow-hidden rounded-2xl p-[1px] transition-all active:scale-95 px-8"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500 bg-[length:200%_100%] animate-[gradient_3s_linear_infinite] rounded-2xl opacity-80 group-hover/btn:opacity-100 transition-opacity" />
                  <div className="relative bg-[#0c0c0c] rounded-2xl py-4 px-8 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs transition-colors group-hover/btn:bg-transparent text-white">
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Finalize Hire <ChevronRight size={16} />
                      </>
                    )}
                  </div>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
