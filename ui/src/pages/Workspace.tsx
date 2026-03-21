import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { File, Folder, Trash2, FileText, ChevronRight, X, Terminal, Cpu, Globe, Search } from 'lucide-react';
import axios from 'axios';

export function Workspace() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const { data } = await axios.get('http://localhost:3001/api/workspace');
      setFiles(data);
    } catch (error) {
      console.error('Failed to fetch workspace:', error);
    } finally {
      setLoading(false);
    }
  };

  const readFile = async (fileName: string) => {
    try {
      setContentLoading(true);
      setSelectedFile(fileName);
      const { data } = await axios.get(`http://localhost:3001/api/workspace/file?path=${fileName}`);
      setFileContent(data.content);
    } catch (error) {
      console.error('Failed to read file:', error);
      setFileContent('Error loading file content.');
    } finally {
      setContentLoading(false);
    }
  };

  const deleteFile = async (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this file?')) return;
    try {
      await axios.delete('http://localhost:3001/api/workspace/file', { data: { path } });
      if (selectedFile === path) {
        setSelectedFile(null);
        setFileContent(null);
      }
      fetchFiles();
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-400 font-black uppercase tracking-[0.2em] text-xs">
            <Globe size={14} />
            Workspace Root
          </div>
          <h1 className="text-5xl font-black tracking-tighter leading-none">
            DATA <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">VAULT.</span>
          </h1>
        </div>

        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 backdrop-blur-xl">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-400 transition-colors" size={16} />
              <input
                type="text"
                placeholder="Search vault..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-all w-64"
              />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">

        {/* File List */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="lg:col-span-4 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 flex flex-col overflow-hidden"
        >
          <div className="flex items-center gap-2 px-4 mb-6 text-white/40 font-black text-[10px] uppercase tracking-widest">
            <Terminal size={14} />
            File Manifest
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-1 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-white/10 space-y-4">
                <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                <p className="font-black uppercase tracking-widest text-[10px]">Scanning Disk...</p>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="py-20 text-center text-white/20 font-bold uppercase tracking-widest text-[10px]">No files found</div>
            ) : (
              filteredFiles.map((file, i) => (
                <motion.div
                  key={i}
                  variants={item}
                  onClick={() => !file.isDirectory && readFile(file.name)}
                  className={`group flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer ${
                    selectedFile === file.name
                      ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                      : 'hover:bg-white/5 border border-transparent text-white/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                      file.isDirectory ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-white/5 border-white/10 text-white/30'
                    }`}>
                      {file.isDirectory ? <Folder size={18} /> : <FileText size={18} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{file.name}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{file.isDirectory ? 'Directory' : 'File'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!file.isDirectory && (
                      <button
                        onClick={(e) => deleteFile(e, file.name)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-white/10 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                    <ChevronRight size={14} className={`transition-transform ${selectedFile === file.name ? 'rotate-90 text-blue-400' : 'text-white/10 group-hover:translate-x-1'}`} />
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Content Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-8 bg-[#080808] border border-white/10 rounded-[2.5rem] flex flex-col overflow-hidden relative shadow-2xl"
        >
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none" />

          {/* Preview Header */}
          <div className="h-16 border-b border-white/10 bg-black/40 flex items-center justify-between px-8 shrink-0 backdrop-blur-xl relative z-10">
            <div className="flex items-center gap-4">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <div className="h-4 w-[1px] bg-white/10 mx-2" />
              <div className="flex items-center gap-2">
                <File size={16} className="text-white/30" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-white/40">
                  {selectedFile || 'Neural_Preview_v1.0'}
                </span>
              </div>
            </div>
            {selectedFile && (
              <button
                onClick={() => { setSelectedFile(null); setFileContent(null); }}
                className="p-2.5 hover:bg-white/5 rounded-xl transition-all text-white/20 hover:text-white"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Preview Body */}
          <div className="flex-1 overflow-y-auto p-8 font-mono text-sm custom-scrollbar relative z-10">
            {contentLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-white/10 space-y-4">
                <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                <p className="font-black uppercase tracking-[0.3em] text-xs">Accessing Encrypted Data...</p>
              </div>
            ) : !selectedFile ? (
              <div className="h-full flex flex-col items-center justify-center text-white/10 space-y-4">
                <Cpu size={64} className="opacity-5" />
                <p className="font-black uppercase tracking-[0.3em] text-xs text-center">
                  Select a file from the manifest <br />
                  to initialize neural preview
                </p>
              </div>
            ) : (
              <pre className="text-white/70 leading-relaxed whitespace-pre-wrap break-words">
                {fileContent}
              </pre>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}

