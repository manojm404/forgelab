import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Zap, TrendingUp } from 'lucide-react';

interface AgentStatsProps {
  completedTasks: number;
  clientSatisfaction: number;
  avgDeliveryTime: string;
  responseTime: string;
}

export function AgentStats({
  completedTasks,
  clientSatisfaction,
  avgDeliveryTime,
  responseTime
}: AgentStatsProps) {
  const stats = [
    {
      icon: CheckCircle2,
      label: 'Successful Tasks',
      value: completedTasks,
      suffix: '',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20'
    },
    {
      icon: TrendingUp,
      label: 'Client Satisfaction',
      value: clientSatisfaction,
      suffix: '%',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      icon: Clock,
      label: 'Avg Delivery',
      value: avgDeliveryTime,
      suffix: '',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
    {
      icon: Zap,
      label: 'Avg Response',
      value: responseTime,
      suffix: '',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <Zap size={20} className="text-yellow-400" />
        Quick Stats
      </h3>
      
      <div className="space-y-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-4 rounded-xl ${stat.bgColor} border ${stat.borderColor} transition-all hover:scale-[1.02]`}
          >
            <div className="flex items-center gap-3">
              <stat.icon size={20} className={stat.color} />
              <span className="text-sm text-white/60">{stat.label}</span>
            </div>
            <span className={`text-lg font-bold ${stat.color}`}>
              {stat.value}{stat.suffix}
            </span>
          </div>
        ))}
      </div>

      {/* Tooltip hint */}
      <p className="mt-4 text-xs text-white/30 text-center">
        Stats updated in real-time from completed tasks
      </p>
    </motion.div>
  );
}
