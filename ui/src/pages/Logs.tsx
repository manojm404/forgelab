import React, { useEffect, useState } from 'react';
import axios from 'axios';

export function Logs() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      // Assuming we have an endpoint for logs
      const { data } = await axios.get('http://localhost:3001/api/dashboard/logs');
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">System Logs</h1>
      <div className="bg-black/40 p-6 rounded-2xl border border-white/10 font-mono text-sm">
        {logs.map((log, i) => (
          <div key={i} className="mb-2">
            <span className="text-white/30">[{new Date(log.timestamp).toLocaleString()}]</span>
            <span className={`ml-2 ${log.type === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
