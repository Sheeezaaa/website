import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  RefreshCw, 
  Calendar, 
  User, 
  FileText,
  Clock
} from 'lucide-react';
import { apiGetAuditLogs } from '../../utils/api';

export default function AuditLogsViewer({ isDark }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await apiGetAuditLogs();
      if (Array.isArray(data)) setLogs(data);
    } catch {}
    finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const s = search.toLowerCase();
    return (
      (log.actor || '').toLowerCase().includes(s) ||
      (log.action || '').toLowerCase().includes(s) ||
      (log.targetType || '').toLowerCase().includes(s) ||
      (log.targetId || '').toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className={`text-xl font-heading font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Championship Security & Audit Trail
          </h3>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-0.5`}>
            Immutable ledger recording administrative actions, approvals, scoring modifications, and buzzer events.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
            isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
          title="Refresh Audit Logs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-500' : ''}`} />
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Filter audit logs by actor, action type, or target ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs border focus:outline-none ${
            isDark ? 'bg-black/50 border-white/10 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500'
          }`}
        />
      </div>

      {/* Audit Log Table */}
      <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-slate-800 bg-[#090f1d]' : 'border-slate-200 bg-white'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b ${isDark ? 'border-slate-800 bg-black/40 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                <th className="p-3.5 font-heading font-bold w-44">Timestamp</th>
                <th className="p-3.5 font-heading font-bold">Actor</th>
                <th className="p-3.5 font-heading font-bold">Action</th>
                <th className="p-3.5 font-heading font-bold">Target</th>
                <th className="p-3.5 font-heading font-bold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[11px]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-sans">
                    No audit log events match criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] text-slate-300">
                    <td className="p-3.5 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3.5 font-bold text-white">
                      {log.actor}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-400 border border-blue-500/30">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">
                      {log.targetType}: <span className="text-white">{log.targetId}</span>
                    </td>
                    <td className="p-3.5 text-slate-400 truncate max-w-xs font-sans text-xs">
                      {log.details ? JSON.stringify(log.details) : '--'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
