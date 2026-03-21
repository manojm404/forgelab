import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Cloud, Stars } from 'lucide-react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const theme = localStorage.getItem('forgelab_theme') || 'dark';
    setIsDark(theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.style.colorScheme = theme;
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark ? 'dark' : 'light';
    setIsDark(!isDark);
    localStorage.setItem('forgelab_theme', newTheme);
    document.documentElement.classList.toggle('light', newTheme === 'light');
    document.documentElement.style.colorScheme = newTheme;
  };

  return (
    <div className="flex items-center gap-3">
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="owl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="hidden sm:block text-emerald-400/40 animate-cute-float"
          >
            🦉
          </motion.div>
        ) : (
          <motion.div
            key="bird"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="hidden sm:block text-orange-400/40 animate-cute-float"
          >
            🐦
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={toggleTheme}
        className="relative w-16 h-8 rounded-full bg-white/5 border border-white/10 p-1 flex items-center transition-colors hover:border-white/20 overflow-hidden group shadow-inner"
      >
        <motion.div
          animate={{ x: isDark ? 32 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="relative z-10 w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.3)]"
        >
          <AnimatePresence mode="wait">
            {isDark ? (
              <motion.div
                key="moon"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
              >
                <Moon size={12} className="text-white fill-white" />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
              >
                <Sun size={12} className="text-white fill-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="absolute inset-0 flex justify-between items-center px-2 opacity-20 group-hover:opacity-40 transition-opacity">
          <Stars size={10} className={isDark ? "text-white" : "text-transparent"} />
          <Cloud size={10} className={!isDark ? "text-blue-400" : "text-transparent"} />
        </div>
      </button>
    </div>
  );
}
