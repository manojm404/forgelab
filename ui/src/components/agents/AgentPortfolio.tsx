import React from 'react';
import { motion } from 'framer-motion';
import { Star, ExternalLink, FolderOpen } from 'lucide-react';
import { PortfolioItem } from '../../lib/agentCategories';

interface AgentPortfolioProps {
  portfolio: PortfolioItem[];
}

export function AgentPortfolio({ portfolio }: AgentPortfolioProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <FolderOpen size={20} className="text-blue-400" />
          Portfolio / Recent Work
        </h3>
        <a
          href="#"
          className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5"
        >
          View All Projects
          <ExternalLink size={14} />
        </a>
      </div>

      <div className="space-y-3">
        {portfolio.map((item, index) => (
          <div
            key={item.id}
            className="group p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white group-hover:text-emerald-400 transition-colors truncate">
                  {item.title}
                </h4>
                <p className="mt-1 text-sm text-white/50 truncate">{item.description}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-md bg-white/5 text-white/40">
                    {item.type}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={i < item.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-white/10 text-white/20'}
                    />
                  ))}
                </div>
                <ExternalLink size={14} className="text-white/30 group-hover:text-white/60 transition-colors" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
