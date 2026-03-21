import React from 'react';
import { motion } from 'framer-motion';
import { Star, Zap } from 'lucide-react';
import { getStatusIndicator } from '../../lib/agentCategories';

interface AgentHeroProps {
  name: string;
  role: string;
  categoryName: string;
  emoji: string;
  status: string;
  rating: number;
  reviewCount: number;
  onHire: () => void;
  onStartTask: () => void;
}

export function AgentHero({
  name,
  role,
  categoryName,
  emoji,
  status,
  rating,
  reviewCount,
  onHire,
  onStartTask
}: AgentHeroProps) {
  const statusIndicator = getStatusIndicator(status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-emerald-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 rounded-full blur-3xl" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-6">
          {/* Left: Avatar + Info */}
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-blue-500/20 flex items-center justify-center border border-white/20 shadow-xl">
              <span className="text-4xl">{emoji}</span>
            </div>

            {/* Agent Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold tracking-tight text-white">{name}</h1>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium">
                  <span>{statusIndicator.emoji}</span>
                  <span className="text-white/70">{statusIndicator.text}</span>
                </div>
              </div>
              
              <p className="text-lg text-emerald-400/80 font-medium">{categoryName}</p>
              
              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-white/10 text-white/20'}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-white/80">
                  {rating.toFixed(1)}/5
                </span>
                <span className="text-sm text-white/40">
                  ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onStartTask}
              className="px-6 py-3.5 rounded-xl font-semibold bg-white/5 hover:bg-white/10 border border-white/20 text-white transition-all flex items-center gap-2.5 hover:scale-105 active:scale-95"
            >
              <Zap size={18} className="fill-current" />
              START TASK
            </button>
            <button
              onClick={onHire}
              className="px-6 py-3.5 rounded-xl font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 active:scale-95"
            >
              🚀 HIRE THIS AGENT
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
