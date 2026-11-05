import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  SkipForward, 
  Trophy, 
  AlertTriangle, 
  Play, 
  Square, 
  RotateCcw,
  User,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { 
  apiGetRapidFireCandidates, 
  apiStartRapidFire, 
  apiRapidFireAction, 
  apiFinishRapidFire, 
  apiGetRapidFireState 
} from '../../utils/api';
import { playCorrectChime, playAntiCheatBuzzer } from '../../utils/soundEffects';

export default function RapidFireConsole({ isDark }) {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [state, setState] = useState({ status: 'idle' });
  const [totalSecondsLeft, setTotalSecondsLeft] = useState(180);
  const [questionSecondsLeft, setQuestionSecondsLeft] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch candidates upon load
  useEffect(() => {
    fetchCandidates();
    fetchState();
  }, []);

  const fetchCandidates = async () => {
    try {
      const list = await apiGetRapidFireCandidates();
      if (Array.isArray(list)) {
        setCandidates(list);
        if (list.length > 0 && !selectedCandidate) {
          setSelectedCandidate(list[0]);
        }
      }
    } catch {}
  };

  const fetchState = async () => {
    try {
      const s = await apiGetRapidFireState();
      if (s) setState(s);
    } catch {}
  };

  // Overall 3-minute timer countdown
  useEffect(() => {
    if (state.status !== 'running' || !state.expiresAt) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const expires = new Date(state.expiresAt).getTime();
      const diff = Math.max(0, Math.floor((expires - now) / 1000));
      setTotalSecondsLeft(diff);

      if (diff <= 0) {
        clearInterval(interval);
        handleFinishTurn();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.status, state.expiresAt]);

  // 3-second per-question timer
  useEffect(() => {
    if (state.status !== 'running') return;
    setQuestionSecondsLeft(3);

    const qInterval = setInterval(() => {
      setQuestionSecondsLeft((prev) => {
        if (prev <= 1) {
          // 3 seconds passed: auto skip
          playAntiCheatBuzzer();
          handleAction('skip');
          return 3;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(qInterval);
  }, [state.currentQuestionIndex, state.status]);

  const handleStart = async () => {
    if (!selectedCandidate) return;
    setError('');
    setLoading(true);
    try {
      const res = await apiStartRapidFire(selectedCandidate.studentId, selectedCandidate.fullName);
      if (res.success && res.state) {
        setState(res.state);
        setTotalSecondsLeft(180);
        setQuestionSecondsLeft(3);
      } else {
        setError(res.error || 'Failed to start rapid fire round.');
      }
    } catch (err) {
      setError(err.message || 'Start round error.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (actionType) => {
    if (state.status !== 'running') return;
    try {
      if (actionType === 'correct') playCorrectChime();
      const currentQ = (state.questions || [])[state.currentQuestionIndex];
      const res = await apiRapidFireAction(actionType, currentQ?.id);
      if (res.success && res.state) {
        setState(res.state);
        setQuestionSecondsLeft(3);
      }
    } catch (err) {
      console.error('Rapid fire action error:', err);
    }
  };

  const handleFinishTurn = async () => {
    try {
      const res = await apiFinishRapidFire();
      if (res.success) {
        setState((prev) => ({ ...prev, status: 'finished' }));
      }
    } catch {}
  };

  const currentQ = (state.questions || [])[state.currentQuestionIndex];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 mb-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Round 03 Semi-Final Console</span>
          </div>
          <h3 className={`text-xl font-heading font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Rapid-Fire Adjudication Deck
          </h3>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-0.5`}>
            3 minutes per individual contestant • Strict 3-second question response/skip rule • Top 2 qualify.
          </p>
        </div>

        {/* Global Round Status Pill */}
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-xs font-mono font-bold ${
            state.status === 'running' 
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
              : 'bg-black/40 border-white/10 text-slate-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${state.status === 'running' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
            <span className="uppercase">{state.status}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Candidate Selection Bar */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <User className="w-5 h-5 text-blue-400" />
          <div>
            <div className="text-xs font-heading font-bold text-slate-300">Active Competitor</div>
            <select
              disabled={state.status === 'running'}
              value={selectedCandidate?.studentId || ''}
              onChange={(e) => {
                const found = candidates.find((c) => c.studentId === e.target.value);
                setSelectedCandidate(found);
              }}
              className={`mt-1 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                isDark ? 'bg-black/60 border-white/15 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              {candidates.map((c) => (
                <option key={c.studentId} value={c.studentId}>
                  {c.fullName} ({c.studentId})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {state.status !== 'running' ? (
            <button
              onClick={handleStart}
              disabled={loading || !selectedCandidate}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-heading font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              <span>Start 3-Minute Turn</span>
            </button>
          ) : (
            <button
              onClick={handleFinishTurn}
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-heading font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <Square className="w-4 h-4" />
              <span>Finish Contestant Turn</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Dual Timer & Live Question Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Live Question & Scoring Actions */}
        <div className={`lg:col-span-8 p-6 rounded-2xl border flex flex-col justify-between ${
          isDark ? 'bg-gradient-to-br from-[#0b1020] to-[#040814] border-white/10' : 'bg-white border-slate-200'
        }`}>
          
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <span className="text-xs font-mono font-bold text-blue-400 uppercase">
                Rapid Stream Question #{((state.currentQuestionIndex || 0) + 1)}
              </span>

              {/* 3-Second Flash Clock */}
              <div className={`px-3 py-1 rounded-xl border flex items-center gap-2 text-xs font-mono font-bold ${
                questionSecondsLeft === 1 
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse' 
                  : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span>Response Window: {questionSecondsLeft}s</span>
              </div>
            </div>

            {currentQ ? (
              <div className="space-y-4">
                <span className="text-xs font-mono text-slate-400">{currentQ.subjectName}</span>
                <h4 className="text-lg sm:text-xl font-heading font-bold text-white leading-relaxed">
                  {currentQ.question}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {currentQ.options.map((opt, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl text-xs font-medium border flex items-center gap-2.5 ${
                        idx === currentQ.correct
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
                          : 'bg-black/40 border-white/10 text-slate-300'
                      }`}
                    >
                      <span className="font-mono font-bold">{String.fromCharCode(65 + idx)}.</span>
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                {state.status === 'finished' 
                  ? 'Candidate rapid-fire turn completed!' 
                  : 'Click "Start 3-Minute Turn" above to initiate rapid stream.'}
              </div>
            )}
          </div>

          {/* Adjudication Trigger Buttons */}
          <div className="pt-6 border-t border-white/10 mt-6 grid grid-cols-3 gap-3">
            <button
              onClick={() => handleAction('correct')}
              disabled={state.status !== 'running'}
              className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-heading font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-40"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Correct (+1 pt)</span>
            </button>

            <button
              onClick={() => handleAction('incorrect')}
              disabled={state.status !== 'running'}
              className="py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-heading font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-40"
            >
              <XCircle className="w-4 h-4" />
              <span>Wrong (0 pts)</span>
            </button>

            <button
              onClick={() => handleAction('skip')}
              disabled={state.status !== 'running'}
              className="py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-heading font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-40"
            >
              <SkipForward className="w-4 h-4" />
              <span>Skip (Cannot repeat)</span>
            </button>
          </div>

        </div>

        {/* Right Column: Timers, Score & Actions History */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* 3-Minute Round Master Clock */}
          <div className={`p-5 rounded-2xl border text-center ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <span className="text-[11px] font-heading font-semibold text-slate-400 uppercase tracking-wider">
              Overall 3-Minute Round Timer
            </span>
            <div className="text-4xl font-mono font-black text-amber-400 my-1">
              {Math.floor(totalSecondsLeft / 60)}:{(totalSecondsLeft % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-[10px] text-slate-500">Authoritative server synchronization</div>
          </div>

          {/* Current Turn Scoreboard */}
          <div className={`p-5 rounded-2xl border ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <span className="text-[11px] font-heading font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Turn Metrics
            </span>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-xl font-mono font-black text-emerald-400">{state.correctCount || 0}</div>
                <div className="text-[10px] text-slate-400">Correct</div>
              </div>
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <div className="text-xl font-mono font-black text-rose-400">{state.incorrectCount || 0}</div>
                <div className="text-[10px] text-slate-400">Wrong</div>
              </div>
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="text-xl font-mono font-black text-amber-400">{state.skippedCount || 0}</div>
                <div className="text-[10px] text-slate-400">Skipped</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-heading font-bold">Total Turn Score:</span>
              <span className="text-lg font-mono font-black text-blue-400">
                {(state.score || 0).toFixed(1)} pts
              </span>
            </div>
          </div>

          {/* Actions Log */}
          <div className={`p-4 rounded-2xl border ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <span className="text-[11px] font-heading font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Adjudication Audit Log
            </span>
            <div className="space-y-1.5 max-h-40 overflow-y-auto text-[11px]">
              {(state.actionsLog || []).length === 0 ? (
                <div className="text-slate-500">No actions recorded for this candidate yet.</div>
              ) : (
                (state.actionsLog || []).map((log, idx) => (
                  <div key={idx} className="flex justify-between items-center p-1.5 rounded-lg bg-black/40 border border-white/5">
                    <span className="font-mono text-slate-400">{log.questionId}</span>
                    <span className={`font-bold capitalize ${
                      log.action === 'correct' ? 'text-emerald-400' : log.action === 'incorrect' ? 'text-rose-400' : 'text-amber-400'
                    }`}>
                      {log.action} ({log.delta > 0 ? `+${log.delta}` : log.delta})
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
