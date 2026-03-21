import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

interface AgentQuoteProps {
  tagline: string;
  agentName: string;
}

export function AgentQuote({ tagline, agentName }: AgentQuoteProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden"
    >
      {/* Decorative quote icon */}
      <div className="absolute top-6 right-6 text-white/5">
        <Quote size={80} />
      </div>

      <div className="relative z-10">
        <div className="flex items-start gap-4">
          <Quote size={24} className="text-emerald-400/50 mt-1 shrink-0" />
          <div>
            <p className="text-xl md:text-2xl font-medium text-white/90 leading-relaxed">
              {tagline}
            </p>
            <p className="mt-4 text-sm font-medium text-emerald-400/80">
              — {agentName}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
