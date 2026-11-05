import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Zap, 
  Gavel, 
  Sparkles,
  Users,
  Search,
  Filter,
  Download,
  Medal,
  Flame,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { 
  apiGetLeaderboard, 
  apiCalculateQualification, 
  apiPublishResults,
  apiGetQualificationStatus 
} from '../../utils/api';

export default function ResultsManagement({ isDark }) {
  const [leaderboardData, setLeaderboardData] = useState({ leaderboard: [], totalCompetitors: 0 });
  const [qualificationStatus, setQualificationStatus] = useState(null);
  const [selectedViewRound, setSelectedViewRound] = useState('all'); // 'all' | 'r1' | 'r2' | 'r3' | 'r4'
  const [searchQuery, setSearchQuery] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', isError: false });
  const [tieNotice, setTieNotice] = useState('');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const [lb, qStatus] = await Promise.all([
        apiGetLeaderboard(),
        apiGetQualificationStatus(),
      ]);
      if (lb) setLeaderboardData(lb);
      if (qStatus) setQualificationStatus(qStatus);
    } catch (err) {
      console.error('Error fetching results:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunQualification = async (roundNum) => {
    setLoading(true);
    setStatusMessage({ text: '', isError: false });
    setTieNotice('');
    try {
      const res = await apiCalculateQualification(roundNum);
      if (res.success) {
        setStatusMessage({
          text: `Qualification calculated for Round 0${roundNum}! ${res.qualifiedCount} of ${res.totalEvaluated} students advanced.`,
          isError: false,
        });
        if (res.hasTie) {
          setTieNotice(res.tieProtocolMessage);
        }
        fetchResults();
      } else {
        setStatusMessage({ text: res.error || 'Qualification calculation failed.', isError: true });
      }
    } catch (err) {
      setStatusMessage({ text: err.message, isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async () => {
    const nextState = !isPublished;
    try {
      const res = await apiPublishResults(nextState);
      if (res.success) {
        setIsPublished(nextState);
        setStatusMessage({ text: `Public leaderboard is now ${nextState ? 'PUBLISHED' : 'HIDDEN'}!`, isError: false });
      }
    } catch (err) {
      setStatusMessage({ text: err.message, isError: true });
    }
  };

  const exportCSV = () => {
    if (leaderboardData.leaderboard.length === 0) return;
    const headers = ["Rank", "Student ID", "Full Name", "Department", "Semester", "Round 1 (MCQ)", "Round 2 (Core)", "Round 3 (Rapid)", "Round 4 (Buzzer)", "Total Score", "Status"];
    const rows = leaderboardData.leaderboard.map((item, idx) => [
      `"${item.rank || idx + 1}"`,
      `"${item.studentId}"`,
      `"${item.fullName}"`,
      `"${item.department || 'Computer Science'}"`,
      `"${item.semester || '4th'}"`,
      `"${item.round1Score || 0}"`,
      `"${item.round2Score || 0}"`,
      `"${item.round3Score || 0}"`,
      `"${item.round4Score || 0}"`,
      `"${item.totalScore || 0}"`,
      `"${item.isChampion ? 'Champion' : item.isQualifiedRound3 ? 'Finalist' : item.isQualifiedRound2 ? 'Semi-Finalist' : item.isQualifiedRound1 ? 'Qualified' : 'Participated'}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BOB_Results_Round_${selectedViewRound}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const round1List = leaderboardData.leaderboard.filter((s) => (s.round1Score !== undefined && s.round1Score !== null) || s.isQualifiedRound1);
  const round2List = leaderboardData.leaderboard.filter((s) => (s.round2Score !== undefined && s.round2Score !== null) || s.isQualifiedRound2);
  const round3List = leaderboardData.leaderboard.filter((s) => (s.round3Score !== undefined && s.round3Score !== null) || s.isQualifiedRound3);
  const round4List = leaderboardData.leaderboard.filter((s) => (s.round4Score !== undefined && s.round4Score !== null) || s.isChampion);

  const round1Count = leaderboardData.leaderboard.filter((s) => s.isQualifiedRound1).length;
  const round2Count = leaderboardData.leaderboard.filter((s) => s.isQualifiedRound2).length;
  const round3Count = leaderboardData.leaderboard.filter((s) => s.isQualifiedRound3).length;
  const champion = leaderboardData.leaderboard.find((s) => s.isChampion) || leaderboardData.leaderboard[0];
  const runnerUp = leaderboardData.leaderboard.filter(s => s.studentId !== champion?.studentId)[0];

  // Filtering by search
  const filterBySearch = (list) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(item => 
      (item.fullName || '').toLowerCase().includes(q) ||
      (item.studentId || '').toLowerCase().includes(q) ||
      (item.registrationRef || '').toLowerCase().includes(q)
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Leaderboard & Tournament Qualification Center</span>
          </div>
          <h3 className={`text-xl font-heading font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Official Tournament Results & Round Progression
          </h3>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-0.5`}>
            Detailed results for Round 1 (Top 80%), Round 2 (Top 4), Round 3 (Top 2), and Round 4 (Buzzer Champion).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-heading font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Results</span>
          </button>

          <button
            onClick={handleTogglePublish}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-bold flex items-center gap-2 border transition-all cursor-pointer ${
              isPublished
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/30'
                : 'bg-rose-600/20 text-rose-300 border-rose-500/40 hover:bg-rose-600/30'
            }`}
          >
            {isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>{isPublished ? 'Published' : 'Draft (Hidden)'}</span>
          </button>

          <button
            onClick={fetchResults}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            title="Refresh Leaderboard"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-500' : ''}`} />
          </button>
        </div>
      </div>

      {statusMessage.text && (
        <div className={`p-3.5 rounded-xl text-xs flex items-center justify-between ${
          statusMessage.isError ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300' : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
        }`}>
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage({ text: '', isError: false })}>×</button>
        </div>
      )}

      {/* Tie-Breaker Notice Alert */}
      {tieNotice && (
        <div className="p-4 rounded-xl bg-amber-500/15 border-2 border-amber-500/50 text-amber-300 text-xs flex items-start gap-3 animate-fadeIn">
          <Gavel className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-white block font-heading font-bold text-sm">Official Tie-Breaker Triggered!</strong>
            <p className="leading-relaxed">{tieNotice}</p>
            <div className="text-[11px] text-amber-200">
              Protocol: Conduct 2 additional tie-breaker questions. If tie persists, conduct sudden-death buzzer decider.
            </div>
          </div>
        </div>
      )}

      {/* Automated Qualification Triggers Bar */}
      <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
        <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-slate-400 block mb-3">
          Execute Round Qualification Engine
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          
          <button
            onClick={() => handleRunQualification(1)}
            disabled={loading}
            className="p-3.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-left transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-mono font-bold text-blue-400">ROUND 01 SCREENING</div>
            <div className="text-xs font-heading font-bold text-white mt-1 group-hover:text-blue-300">
              Qualify Top 80% →
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Advanced: {round1Count} students</div>
          </button>

          <button
            onClick={() => handleRunQualification(2)}
            disabled={loading}
            className="p-3.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-left transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-mono font-bold text-indigo-400">ROUND 02 CORE CS</div>
            <div className="text-xs font-heading font-bold text-white mt-1 group-hover:text-indigo-300">
              Qualify Top 4 →
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Advanced: {round2Count} students</div>
          </button>

          <button
            onClick={() => handleRunQualification(3)}
            disabled={loading}
            className="p-3.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-left transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-mono font-bold text-amber-400">ROUND 03 RAPID FIRE</div>
            <div className="text-xs font-heading font-bold text-white mt-1 group-hover:text-amber-300">
              Qualify Top 2 Finalists →
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Finalists: {round3Count} students</div>
          </button>

          <button
            onClick={() => handleRunQualification(4)}
            disabled={loading}
            className="p-3.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-left transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-mono font-bold text-emerald-400">ROUND 04 BUZZER FINAL</div>
            <div className="text-xs font-heading font-bold text-white mt-1 group-hover:text-emerald-300">
              Crown Champion 🏆
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Winner: {champion?.fullName || 'TBD'}</div>
          </button>

        </div>
      </div>

      {/* Round Breakdown View Navigation */}
      <div className={`p-1.5 rounded-2xl border flex flex-wrap items-center gap-1.5 ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100 border-slate-200'
      }`}>
        <button
          onClick={() => setSelectedViewRound('all')}
          className={`py-2 px-3.5 rounded-xl text-xs font-heading font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedViewRound === 'all'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>All Rounds Summary</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/25">
            {leaderboardData.leaderboard.length}
          </span>
        </button>

        <button
          onClick={() => setSelectedViewRound('r1')}
          className={`py-2 px-3.5 rounded-xl text-xs font-heading font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedViewRound === 'r1'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <span>Round 1: Screening (Top 80%)</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/25">
            {round1Count} Qualified
          </span>
        </button>

        <button
          onClick={() => setSelectedViewRound('r2')}
          className={`py-2 px-3.5 rounded-xl text-xs font-heading font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedViewRound === 'r2'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <span>Round 2: Core CS (Top 4)</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/25">
            {round2Count} Semi-Finalists
          </span>
        </button>

        <button
          onClick={() => setSelectedViewRound('r3')}
          className={`py-2 px-3.5 rounded-xl text-xs font-heading font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedViewRound === 'r3'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-300" />
          <span>Round 3: Rapid Fire (Top 2)</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/25">
            {round3Count} Finalists
          </span>
        </button>

        <button
          onClick={() => setSelectedViewRound('r4')}
          className={`py-2 px-3.5 rounded-xl text-xs font-heading font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedViewRound === 'r4'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-300" />
          <span>Round 4: Buzzer Champion</span>
        </button>
      </div>

      {/* Search Input Filter */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Filter contestants by name, Student ID, or Pass Reference..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border focus:outline-none ${
            isDark ? 'bg-black/50 border-white/10 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500'
          }`}
        />
      </div>

      {/* ========================================================= */}
      {/* ROUND 4 PODIUM SHOWCASE (If R4 selected or Champion exists) */}
      {/* ========================================================= */}
      {selectedViewRound === 'r4' && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-emerald-500/15 border-2 border-amber-500/40 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>GRAND FINAL BUZZER SHOWDOWN RESULTS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto pt-2">
            {/* Champion Card */}
            <div className="p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/60 shadow-xl space-y-2 text-left">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-amber-500 text-black uppercase">
                🏆 Tournament Champion
              </span>
              <h4 className="text-xl font-heading font-black text-white mt-1">
                {champion?.fullName || 'TBD'}
              </h4>
              <div className="text-xs font-mono text-slate-400">{champion?.studentId} • {champion?.department || 'Computer Science'}</div>
              <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs">
                <span className="text-slate-400">Buzzer Final Score:</span>
                <span className="text-lg font-mono font-black text-amber-400">{champion?.round4Score || champion?.totalScore || 0} pts</span>
              </div>
            </div>

            {/* Runner-Up Card */}
            <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700 space-y-2 text-left">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-slate-300 text-black uppercase">
                🥈 Grand Final Runner-Up
              </span>
              <h4 className="text-xl font-heading font-black text-white mt-1">
                {runnerUp?.fullName || 'TBD'}
              </h4>
              <div className="text-xs font-mono text-slate-400">{runnerUp?.studentId} • {runnerUp?.department || 'Computer Science'}</div>
              <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs">
                <span className="text-slate-400">Final Score:</span>
                <span className="text-lg font-mono font-black text-slate-300">{runnerUp?.round4Score || runnerUp?.totalScore || 0} pts</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Master Leaderboard Table */}
      <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-slate-800 bg-[#090f1d]' : 'border-slate-200 bg-white'}`}>
        <div className="p-4 border-b flex items-center justify-between border-white/5 bg-black/40">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="font-heading font-bold text-white text-xs uppercase tracking-wider">
              {selectedViewRound === 'all' && `Overall Tournament Championship Standings (${leaderboardData.totalCompetitors} Competitors)`}
              {selectedViewRound === 'r1' && `Round 01: Screening Test Standings (Top 80% Qualified)`}
              {selectedViewRound === 'r2' && `Round 02: Core CS Technical Standings (Top 4 Advanced)`}
              {selectedViewRound === 'r3' && `Round 03: Rapid Fire Speed Standings (Top 2 Finalists)`}
              {selectedViewRound === 'r4' && `Round 04: Grand Final Buzzer Standings`}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Synced: {new Date(leaderboardData.lastUpdated || Date.now()).toLocaleTimeString()}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b ${isDark ? 'border-slate-800 bg-black/20 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                <th className="p-3.5 font-heading font-bold text-center w-12">Rank</th>
                <th className="p-3.5 font-heading font-bold">Contestant</th>
                <th className="p-3.5 font-heading font-bold">Department</th>

                {selectedViewRound === 'all' && (
                  <>
                    <th className="p-3.5 font-heading font-bold text-center">R1 (MCQ)</th>
                    <th className="p-3.5 font-heading font-bold text-center">R2 (Core)</th>
                    <th className="p-3.5 font-heading font-bold text-center">R3 (Rapid)</th>
                    <th className="p-3.5 font-heading font-bold text-center">R4 (Buzzer)</th>
                    <th className="p-3.5 font-heading font-bold text-center text-blue-400">Total Score</th>
                  </>
                )}

                {selectedViewRound === 'r1' && (
                  <>
                    <th className="p-3.5 font-heading font-bold text-center text-blue-400">R1 Score (10 MCQs)</th>
                    <th className="p-3.5 font-heading font-bold text-center">Cutoff Status</th>
                  </>
                )}

                {selectedViewRound === 'r2' && (
                  <>
                    <th className="p-3.5 font-heading font-bold text-center text-indigo-400">R2 Core Score</th>
                    <th className="p-3.5 font-heading font-bold text-center">Semi-Final Cutoff</th>
                  </>
                )}

                {selectedViewRound === 'r3' && (
                  <>
                    <th className="p-3.5 font-heading font-bold text-center text-amber-400">R3 Rapid Points</th>
                    <th className="p-3.5 font-heading font-bold text-center">Grand Final Slot</th>
                  </>
                )}

                {selectedViewRound === 'r4' && (
                  <>
                    <th className="p-3.5 font-heading font-bold text-center text-emerald-400">Buzzer Final Points</th>
                    <th className="p-3.5 font-heading font-bold text-center">Cumulative Score</th>
                  </>
                )}

                <th className="p-3.5 font-heading font-bold text-right">Official Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(() => {
                let displayList = leaderboardData.leaderboard;
                if (selectedViewRound === 'r1') {
                  displayList = leaderboardData.leaderboard.filter(s => s.round1Score !== undefined || s.isQualifiedRound1);
                  if (displayList.length === 0) displayList = leaderboardData.leaderboard;
                } else if (selectedViewRound === 'r2') {
                  displayList = leaderboardData.leaderboard.filter(s => s.isQualifiedRound1);
                  if (displayList.length === 0) displayList = leaderboardData.leaderboard.slice(0, 8);
                } else if (selectedViewRound === 'r3') {
                  displayList = leaderboardData.leaderboard.filter(s => s.isQualifiedRound2);
                  if (displayList.length === 0) displayList = leaderboardData.leaderboard.slice(0, 4);
                } else if (selectedViewRound === 'r4') {
                  displayList = leaderboardData.leaderboard.filter(s => s.isQualifiedRound3 || s.isChampion);
                  if (displayList.length === 0) displayList = leaderboardData.leaderboard.slice(0, 2);
                }

                const filtered = filterBySearch(displayList);

                if (filtered.length === 0) {
                  return (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-500">
                        No contestant records found for this round.
                      </td>
                    </tr>
                  );
                }

                return filtered.map((item, idx) => {
                  return (
                    <tr key={item.studentId} className={`hover:bg-white/[0.02] transition-colors ${
                      item.isChampion ? 'bg-amber-500/10' : ''
                    }`}>
                      <td className="p-3.5 text-center font-mono font-black">
                        {idx === 0 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-black font-black text-xs shadow-md">
                            1
                          </span>
                        ) : idx === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-black font-black text-xs">
                            2
                          </span>
                        ) : idx === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs">
                            3
                          </span>
                        ) : (
                          <span className="text-slate-400">#{item.rank || idx + 1}</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <div className="font-heading font-bold text-white flex items-center gap-1.5">
                          <span>{item.fullName}</span>
                          {item.isChampion && <span className="text-amber-400 text-sm">👑</span>}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">{item.studentId} ({item.registrationRef})</div>
                      </td>

                      <td className="p-3.5 text-slate-300">
                        <div>{item.department || 'Computer Science'}</div>
                        <div className="text-[10px] text-slate-400">{item.semester || '4th'}</div>
                      </td>

                      {selectedViewRound === 'all' && (
                        <>
                          <td className="p-3.5 text-center font-mono text-slate-300">
                            {item.round1Score !== undefined ? `${item.round1Score} pts` : '--'}
                          </td>
                          <td className="p-3.5 text-center font-mono text-slate-300">
                            {item.round2Score !== undefined ? `${item.round2Score} pts` : '--'}
                          </td>
                          <td className="p-3.5 text-center font-mono text-slate-300">
                            {item.round3Score !== undefined ? `${item.round3Score} pts` : '--'}
                          </td>
                          <td className="p-3.5 text-center font-mono text-slate-300">
                            {item.round4Score !== undefined ? `${item.round4Score} pts` : '--'}
                          </td>
                          <td className="p-3.5 text-center font-mono font-black text-sm text-blue-400">
                            {item.totalScore}
                          </td>
                        </>
                      )}

                      {selectedViewRound === 'r1' && (
                        <>
                          <td className="p-3.5 text-center font-mono font-black text-blue-400">
                            {item.round1Score !== undefined ? `${item.round1Score} / 10 pts` : '--'}
                          </td>
                          <td className="p-3.5 text-center">
                            {item.isQualifiedRound1 ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                ✓ Top 80% Cutoff Passed
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-500">
                                Below Cutoff
                              </span>
                            )}
                          </td>
                        </>
                      )}

                      {selectedViewRound === 'r2' && (
                        <>
                          <td className="p-3.5 text-center font-mono font-black text-indigo-400">
                            {item.round2Score !== undefined ? `${item.round2Score} pts` : '--'}
                          </td>
                          <td className="p-3.5 text-center">
                            {item.isQualifiedRound2 ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                ✓ Top 4 Semi-Finalist
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-500">
                                Eliminated in R2
                              </span>
                            )}
                          </td>
                        </>
                      )}

                      {selectedViewRound === 'r3' && (
                        <>
                          <td className="p-3.5 text-center font-mono font-black text-amber-400">
                            {item.round3Score !== undefined ? `${item.round3Score} pts` : '--'}
                          </td>
                          <td className="p-3.5 text-center">
                            {item.isQualifiedRound3 ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                ✓ Grand Finalist (Top 2)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-500">
                                3rd/4th Place
                              </span>
                            )}
                          </td>
                        </>
                      )}

                      {selectedViewRound === 'r4' && (
                        <>
                          <td className="p-3.5 text-center font-mono font-black text-emerald-400">
                            {item.round4Score !== undefined ? `${item.round4Score} pts` : `${item.totalScore} pts`}
                          </td>
                          <td className="p-3.5 text-center font-mono font-bold text-white">
                            {item.totalScore} pts
                          </td>
                        </>
                      )}

                      <td className="p-3.5 text-right whitespace-nowrap">
                        {item.isChampion ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            🏆 Champion
                          </span>
                        ) : item.isQualifiedRound3 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            Finalist (R4)
                          </span>
                        ) : item.isQualifiedRound2 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Semi-Finalist (R3)
                          </span>
                        ) : item.isQualifiedRound1 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Qualified (R2)
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">Participated</span>
                        )}
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
