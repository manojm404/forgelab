import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { Testimonial } from '../../lib/agentCategories';

interface AgentTestimonialsProps {
  testimonials: Testimonial[];
}

export function AgentTestimonials({ testimonials }: AgentTestimonialsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare size={20} className="text-purple-400" />
        <h3 className="text-lg font-semibold text-white">💬 What Clients Say</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="p-5 rounded-xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-white/20 transition-all"
          >
            <div className="mb-4">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                ))}
              </div>
              <p className="text-white/80 leading-relaxed italic">"{testimonial.quote}"</p>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400/20 to-blue-500/20 flex items-center justify-center">
                <span className="text-xs font-bold text-emerald-400">
                  {testimonial.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">{testimonial.name}</p>
                <p className="text-xs text-white/40">{testimonial.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
