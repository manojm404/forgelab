import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, ChevronDown, Save, Trash2 } from 'lucide-react';

interface AgentAdvancedConfigProps {
  formData: {
    identity: string;
    soul: string;
    tools: string;
    role: string;
    model: string;
  };
  onChange: (data: any) => void;
  onSave: () => void;
  onDelete: () => void;
  saving: boolean;
}

export function AgentAdvancedConfig({
  formData,
  onChange,
  onSave,
  onDelete,
  saving
}: AgentAdvancedConfigProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden"
    >
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Settings size={20} className="text-white/40" />
          <h3 className="text-lg font-semibold text-white">⚙️ Advanced Configuration</h3>
          <span className="text-xs text-white/30 ml-2">
            {isExpanded ? 'Click to collapse' : 'Click to expand'}
          </span>
        </div>
        <ChevronDown
          size={20}
          className={`text-white/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Collapsible Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 space-y-6 border-t border-white/10">
              {/* Role & Model */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Role</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => onChange({ ...formData, role: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Model</label>
                  <select
                    value={formData.model}
                    onChange={(e) => onChange({ ...formData, model: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white appearance-none focus:outline-none focus:border-emerald-500/50 transition-colors"
                  >
                    <option value="gemini-1.5-flash" className="bg-gray-900">Gemini 1.5 Flash</option>
                    <option value="gemini-1.5-pro" className="bg-gray-900">Gemini 1.5 Pro</option>
                  </select>
                </div>
              </div>

              {/* IDENTITY.md */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">IDENTITY.md</label>
                <textarea
                  value={formData.identity}
                  onChange={(e) => onChange({ ...formData, identity: e.target.value })}
                  className="w-full h-48 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-emerald-500/50 font-mono text-sm resize-none transition-colors"
                />
              </div>

              {/* SOUL.md */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">SOUL.md</label>
                <textarea
                  value={formData.soul}
                  onChange={(e) => onChange({ ...formData, soul: e.target.value })}
                  className="w-full h-48 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-emerald-500/50 font-mono text-sm resize-none transition-colors"
                />
              </div>

              {/* TOOLS.md */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">TOOLS.md</label>
                <textarea
                  value={formData.tools}
                  onChange={(e) => onChange({ ...formData, tools: e.target.value })}
                  className="w-full h-48 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-emerald-500/50 font-mono text-sm resize-none transition-colors"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={onDelete}
                  className="px-5 py-2.5 rounded-xl font-medium bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
                >
                  <Trash2 size={18} />
                  Decommission Agent
                </button>
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl font-medium bg-emerald-500 hover:bg-emerald-600 text-white transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
