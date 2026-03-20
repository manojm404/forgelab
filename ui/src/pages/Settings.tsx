import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Key, Folder, Server } from 'lucide-react';
import axios from 'axios';

export function Settings() {
  const [settings, setSettings] = useState({
    GEMINI_API_KEY: '',
    WORKSPACE_PATH: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get('http://localhost:3001/api/settings');
      setSettings(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post('http://localhost:3001/api/settings', settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-4xl"
    >
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-white/50 text-lg">Configure your ForgeLab platform.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Key className="text-emerald-400" size={20} />
            API Keys
          </h2>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">Gemini API Key</label>
            <input
              type="password"
              value={settings.GEMINI_API_KEY}
              onChange={e => setSettings({ ...settings, GEMINI_API_KEY: e.target.value })}
              placeholder="AIzaSy..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 font-mono"
            />
            <p className="text-xs text-white/40 mt-1">Required for agents to use the Gemini model.</p>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Folder className="text-blue-400" size={20} />
            Workspace
          </h2>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">Workspace Path</label>
            <input
              type="text"
              value={settings.WORKSPACE_PATH}
              onChange={e => setSettings({ ...settings, WORKSPACE_PATH: e.target.value })}
              placeholder="/absolute/path/to/workspace"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 font-mono"
            />
            <p className="text-xs text-white/40 mt-1">Absolute path to your project workspace. Leave blank to use the default `workspace/` folder in the ForgeLab repo.</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl font-medium bg-emerald-500 hover:bg-emerald-600 text-white transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50"
          >
            {saving ? 'Saving...' : <><Save size={18} /> Save Settings</>}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
