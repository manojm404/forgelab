import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, X } from 'lucide-react';

interface AgentTemplatesDropdownProps {
  templates: string[];
  onSelect: (template: string) => void;
  onClose: () => void;
}

export function AgentTemplatesDropdown({
  templates,
  onSelect,
  onClose
}: AgentTemplatesDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <motion.div
      ref={dropdownRef}
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="absolute right-0 top-full mt-2 w-80 bg-[#1a1a1a] border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-emerald-400" />
          <h4 className="font-semibold text-white">Quick Start Templates</h4>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X size={16} className="text-white/40" />
        </button>
      </div>

      <div className="max-h-64 overflow-y-auto p-2 space-y-1">
        {templates.map((template, index) => (
          <button
            key={index}
            onClick={() => onSelect(template)}
            className="w-full text-left p-3 rounded-lg hover:bg-white/10 transition-all group"
          >
            <p className="text-sm text-white/80 group-hover:text-white transition-colors">
              {template}
            </p>
          </button>
        ))}
      </div>

      <div className="p-3 border-t border-white/10 bg-white/5">
        <p className="text-xs text-white/40 text-center">
          Click to auto-fill task description
        </p>
      </div>
    </motion.div>
  );
}
