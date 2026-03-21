import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface AgentCapabilitiesProps {
  capabilities: string[];
}

export function AgentCapabilities({ capabilities }: AgentCapabilitiesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-6">🎯 What I Can Do For You</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {capabilities.map((capability, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Check size={14} className="text-emerald-400" />
            </div>
            <span className="text-sm text-white/80 group-hover:text-white transition-colors">
              {capability}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
