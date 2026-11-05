import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Download, 
  X, 
  Trash2, 
  Building2, 
  Mail, 
  Phone, 
  IdCard,
  FileSpreadsheet,
  FileCode,
  UserCheck
} from 'lucide-react';
import { getStoredParticipants, deleteParticipant, exportParticipantsToCSV } from '../utils/storage';
import { apiGetParticipants, apiDeleteParticipant } from '../utils/api';

export default function RegisteredParticipants({ isOpen, onClose }) {
  const [participants, setParticipants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  useEffect(() => {
    if (isOpen) {
      setParticipants(getStoredParticipants());
      apiGetParticipants().then((serverList) => {
        if (serverList && Array.isArray(serverList)) {
          setParticipants(serverList);
        }
      }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove participant "${name}" from the list?`)) {
      try {
        await apiDeleteParticipant(id);
      } catch {}
      const updated = deleteParticipant(id);
      setParticipants(updated);
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(participants, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `BattleOfBrains_Participants_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchorElem.click();
  };

  const departments = ['All', ...new Set(participants.map((p) => p.department))];

  const filtered = participants.filter((p) => {
    const matchesSearch = 
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDept = selectedDept === 'All' || p.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b1020] border border-white/15 w-full max-w-4xl max-h-[90vh] rounded-2xl flex flex-col relative shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-heading font-black text-white flex items-center gap-2">
                <span>Registered Participants</span>
                <span className="text-xs font-mono font-bold bg-blue-500/20 text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-500/30">
                  {participants.length} Candidates
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Official persistent registry for Battle of Brains 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportParticipantsToCSV(participants)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-semibold text-slate-200 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-semibold text-slate-200 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 transition-colors"
            >
              <FileCode className="w-4 h-4 text-blue-400" />
              <span>JSON</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="p-4 border-b border-white/10 bg-black/20 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by participant name, student ID, email, or pass ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 shrink-0">Dept:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:border-blue-500 focus:outline-none"
            >
              {departments.map((d) => (
                <option key={d} value={d} className="bg-navy-950">
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Participants Cards */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30 text-blue-400" />
              <p className="text-sm font-heading">No participants found matching your search.</p>
            </div>
          ) : (
            filtered.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-xl bg-black/30 border border-white/10 hover:border-blue-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      {p.id}
                    </span>
                    <h4 className="font-heading font-bold text-white text-base">
                      {p.fullName}
                    </h4>
                    <span className="text-xs font-mono text-slate-400">
                      ({p.studentId})
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
                    <span>Department: <strong className="text-slate-200">{p.department}</strong></span>
                    <span>Semester: <strong className="text-slate-200">{p.semester}</strong></span>
                    <span>Email: <span className="text-slate-300">{p.email}</span></span>
                    <span>Phone: <span className="text-slate-300 font-mono">{p.phone}</span></span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(p.id, p.fullName)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 self-end sm:self-center transition-colors"
                  title="Remove participant"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs text-slate-400">
          <span>Persistent Local Demonstration Store</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#2563eb] text-white font-semibold hover:bg-blue-600"
          >
            Close Roster
          </button>
        </div>

      </div>
    </div>
  );
}
