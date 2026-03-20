import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { File, Folder, Trash2, FileText } from 'lucide-react';
import axios from 'axios';

export function Workspace() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const deleteFile = async (path: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    try {
      await axios.delete('http://localhost:3001/api/workspace/file', { data: { path } });
      fetchFiles();
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Workspace</h1>
        <p className="text-white/50 text-lg">Manage files and agent directories.</p>
      </div>

      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <div className="space-y-2">
            {files.map((file, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  {file.isDirectory ? <Folder className="text-blue-400" /> : <FileText className="text-white/50" />}
                  <span className="text-white">{file.name}</span>
                </div>
                {!file.isDirectory && (
                  <button onClick={() => deleteFile(file.name)} className="text-red-400 hover:text-red-300">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
