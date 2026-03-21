import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Key, Folder, Server, Shield, Database, Cpu, Globe, Zap, AlertCircle } from 'lucide-react';
import axios from 'axios';

export function Settings() {
  const [settings, setSettings] = useState({
    GEMINI_API_KEY: '',
    WORKSPACE_PATH: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setError(null);
      const { data } = await axios.get('http://localhost:3001/api/settings');
      setSettings(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setError('Could not connect to the ForgeLab backend. Please ensure the server is running on port 3001.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post('http://localhost:3001/api/settings', settings);
      alert('Neural configurations updated successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Check backend connectivity.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
        <p className="text-emerald-500 font-black uppercase tracking-widest text-xs">Syncing Core Settings...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 max-w-5xl mx-auto pb-20"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-black uppercase tracking-[0.2em] text-xs">
            <Shield size={14} />
            Core Configuration
          </div>
          <h1 className="text-6xl font-black tracking-tighter leading-none">
            SYSTEM <br />
            <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">SETTINGS.</span>
          </h1>
        </div>

        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 backdrop-blur-xl">
           <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest">
              <Globe size={12} />
              Node: 01-PROD
           </div>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-6 rounded-[2rem] bg-red-500/10 border border-red-500/20 flex items-start gap-4"
        >
          <AlertCircle className="text-red-500 shrink-0" size={24} />
          <div>
            <p className="text-red-400 font-bold uppercase tracking-widest text-xs mb-1">Connectivity Error</p>
            <p className="text-white/60 text-sm leading-relaxed">{error}</p>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Main Config */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 space-y-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Cpu size={160} />
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-xl font-black flex items-center gap-3">
                  <Key className="text-emerald-400" size={20} />
                  Neural API Access
                </h2>
                <div className="space-y-2 group/input">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 group-focus-within/input:text-emerald-400 transition-colors ml-1">Gemini API Key</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={settings.GEMINI_API_KEY}
                      onChange={e => setSettings({ ...settings, GEMINI_API_KEY: e.target.value })}
                      placeholder="AIzaSy..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-white/10 focus:outline-none focus:border-emerald-500/50 font-mono transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-white/20 font-medium ml-1 italic">Required for agent brain functions and tool execution.</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <h2 className="text-xl font-black flex items-center gap-3">
                  <Folder className="text-blue-400" size={20} />
                  Workspace Root
                </h2>
                <div className="space-y-2 group/input">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 group-focus-within/input:text-blue-400 transition-colors ml-1">Absolute Directory Path</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={settings.WORKSPACE_PATH}
                      onChange={e => setSettings({ ...settings, WORKSPACE_PATH: e.target.value })}
                      placeholder="/Users/admin/forgelab/workspace"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-white/10 focus:outline-none focus:border-blue-500/50 font-mono transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-white/20 font-medium ml-1 italic">Where agent identities and memories are persisted. Leave blank for default.</p>
                </div>
              </div>
            </div>

            <div className="pt-6">
               <button
                type="submit"
                disabled={saving || !!error}
                className="w-full relative group/btn overflow-hidden rounded-2xl p-[1px] transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500 bg-[length:200%_100%] animate-[gradient_3s_linear_infinite] rounded-2xl opacity-80 group-hover/btn:opacity-100 transition-opacity" />
                <div className="relative bg-[#0c0c0c] rounded-2xl py-5 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-sm transition-colors group-hover/btn:bg-transparent">
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={18} />
                      Commit Changes
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Status & Info */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6 backdrop-blur-xl">
             <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                <Database size={16} />
                Environment Status
             </h3>

             <div className="space-y-4">
                <StatusItem label="Prisma DB" status="CONNECTED" color="emerald" />
                <StatusItem label="Neural Engine" status="ACTIVE" color="emerald" />
                <StatusItem label="Workspace" status="WRITABLE" color="blue" />
                <StatusItem label="Gemini SDK" status="v0.24.1" color="purple" />
             </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/5 rounded-[2.5rem] p-8 space-y-4">
             <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                <Zap size={24} className="text-purple-400" />
             </div>
             <h3 className="text-xl font-black">Pro Tip</h3>
             <p className="text-sm text-white/40 leading-relaxed">
                Ensure your workspace path is absolute to avoid issues when running agents across different directories. Use <code>/Users/...</code> on macOS or <code>C:\...</code> on Windows.
             </p>
          </div>
        </div>

      </form>
    </motion.div>
  );
}

function StatusItem({ label, status, color }: any) {
  const colors: any = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
      <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{label}</span>
      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${colors[color]}`}>
        {status}
      </span>
    </div>
  );
}

