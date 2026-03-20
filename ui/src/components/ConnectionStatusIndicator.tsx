import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Loader, Zap, RefreshCw } from 'lucide-react';

interface ConnectionStatusIndicatorProps {
  status: 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error';
  detectedUrl?: string;
  onReconnect?: () => void;
}

export function ConnectionStatusIndicator({ status, onReconnect }: ConnectionStatusIndicatorProps) {
  const config = {
    connected: {
      icon: Zap,
      label: 'Live',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      pulse: true,
    },
    connecting: {
      icon: Loader,
      label: 'Connecting...',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      pulse: true,
    },
    reconnecting: {
      icon: RefreshCw,
      label: 'Reconnecting...',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      pulse: true,
    },
    disconnected: {
      icon: WifiOff,
      label: 'Offline',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      pulse: false,
    },
    error: {
      icon: WifiOff,
      label: 'Connection Lost',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      pulse: false,
    },
  };

  const current = config[status];
  const Icon = current.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${current.bgColor} ${current.borderColor} text-xs font-medium ${current.color}`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 180, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Icon 
            size={12} 
            className={current.pulse ? 'animate-pulse' : ''} 
          />
        </motion.div>
      </AnimatePresence>
      
      <span>{current.label}</span>

      {status === 'error' && onReconnect && (
        <button
          onClick={onReconnect}
          className="ml-2 px-2 py-0.5 rounded-md bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors text-xs"
        >
          Reconnect
        </button>
      )}
    </motion.div>
  );
}

// Compact version for subtle placement
export function ConnectionStatusBadge({ status, detectedUrl, onReconnect }: ConnectionStatusIndicatorProps) {
  const config = {
    connected: { color: 'bg-emerald-500', label: 'Live' },
    connecting: { color: 'bg-yellow-500', label: 'Connecting' },
    reconnecting: { color: 'bg-yellow-500', label: 'Reconnecting' },
    disconnected: { color: 'bg-gray-500', label: 'Offline' },
    error: { color: 'bg-red-500', label: 'Error' },
  };

  const current = config[status];

  return (
    <div className="group relative flex items-center gap-1.5 text-xs text-white/50">
      <div className={`w-1.5 h-1.5 rounded-full ${current.color} ${status === 'connected' ? 'animate-pulse' : ''}`} />
      <span>{current.label}</span>
      {detectedUrl && status === 'connected' && (
        <span className="hidden group-hover:inline text-xs text-white/30 ml-2">
          {detectedUrl.replace('ws://', 'http://')}
        </span>
      )}
      {status === 'error' && onReconnect && (
        <button
          onClick={onReconnect}
          className="ml-1 text-red-400 hover:text-red-300 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}
