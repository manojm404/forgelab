import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bot, Activity, Settings, Terminal, Plus, Menu, Users,
  LayoutDashboard, Bell, Search, LogOut, Zap, Shield, ChevronRight, X, User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '../components/ThemeToggle';

const navItems = [
  { icon: LayoutDashboard, label: 'Command Center', path: '/' },
  { icon: Bot, label: 'Agent Marketplace', path: '/agents' },
  { icon: Users, label: 'Collaboration', path: '/team' },
  { icon: Terminal, label: 'Logic Console', path: '/console' },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Start closed for "broader space"
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('forgelab_auth');
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-full bg-[#050505] text-white overflow-hidden selection:bg-emerald-500/30 font-sans">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px] animate-pulse" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-100" />
      </div>

      {/* Floating Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            
            {/* Sidebar Panel */}
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-[300px] m-4 rounded-[2.5rem] border border-white/10 bg-black/40 backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
            >
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-8 h-24">
                <div className="flex items-center gap-3 font-black text-xl tracking-tighter group">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <Bot size={24} className="text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">ForgeLab</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-3 rounded-2xl hover:bg-white/5 transition-all text-white/40 hover:text-white shrink-0 active:scale-90"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-2 space-y-2">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link to={item.path} key={item.path} onClick={() => setSidebarOpen(false)} className="block group">
                      <div className={cn(
                        "relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden",
                        isActive ? "text-white" : "text-white/40 hover:text-white hover:bg-white/5"
                      )}>
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active"
                            className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-2xl border border-white/10"
                            transition={{ type: "spring", stiffness: 200, damping: 25 }}
                          />
                        )}
                        <item.icon size={22} className={cn("relative z-10 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-emerald-400" : "group-hover:text-white")} />
                        <span className="relative z-10 whitespace-nowrap font-bold text-sm tracking-wide">
                          {item.label}
                        </span>
                        {isActive && (
                          <motion.div 
                            layoutId="active-pill"
                            className="ml-auto w-1.5 h-6 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                          />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </nav>

              {/* User Profile & Settings */}
              <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                <div className="flex flex-col gap-2">
                  <Link to="/settings" onClick={() => setSidebarOpen(false)} className="group">
                    <div className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl transition-all duration-300",
                      location.pathname === '/settings' ? "bg-white/5 text-white" : "text-white/40 hover:text-white hover:bg-white/5"
                    )}>
                      <Settings size={20} className={cn("shrink-0", location.pathname === '/settings' ? "text-emerald-400" : "group-hover:text-white")} />
                      <span className="font-bold text-sm tracking-wide flex-1">Settings</span>
                    </div>
                  </Link>

                  <div className="flex items-center gap-4 p-4 rounded-2xl">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-black text-xs border-2 border-white/10 shrink-0">
                      AD
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">Admin User</p>
                      <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Root Access</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-2 rounded-xl hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all active:scale-90"
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        
        {/* Edge Trigger Zone (Invisible hover area to reveal sidebar) */}
        {!isSidebarOpen && (
          <div
            onMouseEnter={() => setSidebarOpen(true)}
            className="fixed left-0 top-0 bottom-0 w-4 z-40 cursor-pointer group"
          >
            <div className="h-full w-full group-hover:bg-emerald-500/5 transition-colors border-r border-transparent group-hover:border-emerald-500/20" />
          </div>
        )}
        {/* Dynamic Header */}
        <header className="h-24 flex items-center justify-between px-10 relative z-10">
          <div className="flex items-center gap-6 flex-1">
            {/* Nav Toggle Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all active:scale-90 shadow-xl"
            >
              <Menu size={24} />
            </button>

            <div className="relative group max-w-md w-full hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-400 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Command search (CMD+K)" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all backdrop-blur-xl"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-4 text-xs font-black uppercase tracking-widest text-white/20 mr-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-emerald-400">
                <Zap size={12} fill="currentColor" />
                System Live
              </div>
            </div>

            <ThemeToggle />

            <button className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all relative group">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#050505] group-hover:scale-125 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/console')}
              className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm transition-all shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Quick Task</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10 px-10 pb-10">
          <div className="max-w-[1600px] mx-auto pt-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
