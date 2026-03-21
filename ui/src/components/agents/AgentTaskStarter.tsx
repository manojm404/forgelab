import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Edit3, Paperclip, ChevronDown } from 'lucide-react';
import { AgentTemplatesDropdown } from './AgentTemplatesDropdown';

interface AgentTaskStarterProps {
  agentName: string;
  onSubmitTask: (description: string) => void;
  quickStartTemplates: string[];
}

export function AgentTaskStarter({
  agentName,
  onSubmitTask,
  quickStartTemplates
}: AgentTaskStarterProps) {
  const [taskDescription, setTaskDescription] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  const handleSubmit = () => {
    if (!taskDescription.trim()) return;
    onSubmitTask(taskDescription);
    setTaskDescription('');
  };

  const handleTemplateSelect = (template: string) => {
    setTaskDescription(template);
    setShowTemplates(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-gradient-to-br from-emerald-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <Play size={20} className="text-emerald-400" />
        <h3 className="text-lg font-semibold text-white">🚀 Start Your First Task</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/60 mb-2">
            What would you like me to create?
          </label>
          <textarea
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            placeholder={`e.g., Write a blog post about AI trends...`}
            className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={!taskDescription.trim()}
            className="px-6 py-3 rounded-xl font-semibold bg-emerald-500 hover:bg-emerald-600 disabled:bg-white/10 disabled:text-white/30 text-white transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 disabled:shadow-none hover:scale-105 active:scale-95 disabled:scale-100"
          >
            <Play size={18} fill="currentColor" />
            Start Task
          </button>

          <button
            className="px-6 py-3 rounded-xl font-medium bg-white/5 hover:bg-white/10 border border-white/20 text-white transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            <Edit3 size={18} />
            Edit Brief
          </button>

          <button
            className="px-6 py-3 rounded-xl font-medium bg-white/5 hover:bg-white/10 border border-white/20 text-white transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            <Paperclip size={18} />
            Upload Reference
          </button>

          <div className="relative ml-auto">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="px-6 py-3 rounded-xl font-medium bg-white/5 hover:bg-white/10 border border-white/20 text-white transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <ChevronDown size={18} className={showTemplates ? 'rotate-180 transition-transform' : 'transition-transform'} />
              Templates
            </button>

            {showTemplates && (
              <AgentTemplatesDropdown
                templates={quickStartTemplates}
                onSelect={handleTemplateSelect}
                onClose={() => setShowTemplates(false)}
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
