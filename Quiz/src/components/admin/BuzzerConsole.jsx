import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RotateCcw, 
  Zap, 
  User, 
  ShieldAlert, 
  Volume2,
  Sparkles,
  ChevronRight,
  Gavel
} from 'lucide-react';
import { 
  apiGetBuzzerFinalists, 
  apiBuzzerPress, 
  apiAdjudicateBuzzer, 
  apiResetBuzzer, 
  apiGetBuzzerState,
  apiGetQuestions
} from '../../utils/api';
import { 
  playBuzzerPress, 
  playCorrectChime, 
  playAntiCheatBuzzer, 
  playDisqualificationSiren 
} from '../../utils/soundEffects';

export default function BuzzerConsole({ isDark }) {
  const [finalists, setFinalists] = useState([]);
  const [buzzerState, setBuzzerState] = useState({ status: 'idle' });
  const [questions, setQuestions] = useState([]);
  const [tenSecondCountdown, setTenSecondCountdown] = useState(10);
  const [penaltyNote, setPenaltyNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  useEffect(() => {
    fetchFinalists();
    fetchBuzzerState();
    loadDeciderQuestions();
  }, []);

  const fetchFinalists = async () => {
    try {
      const data = await apiGetBuzzerFinalists();
      if (Array.isArray(data)) setFinalists(data);
    } catch {}
  };

  const fetchBuzzerState = async () => {
    try {
      const state = await apiGetBuzzerState();
      if (state) setBuzzerState(state);
    } catch {}
  };

  const loadDeciderQuestions = async () => {
    try {
      const q = await apiGetQuestions({ round: 4 });
      if (Array.isArray(q)) setQuestions(q);
    } catch {}
  };

  // 10-Second Authoritative Response Window Countdown
  useEffect(() => {
    if (buzzerState.status !== 'buzzed' || !buzzerState.deadlineTimestamp) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const deadline = new Date(buzzerState.deadlineTimestamp).getTime();
      const diff = Math.max(0, Math.floor((deadline - now) / 1000));
      setTenSecondCountdown(diff);

      if (diff <= 0) {
        clearInterval(interval);
        playAntiCheatBuzzer();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [buzzerState.status, buzzerState.deadlineTimestamp]);

  // Simulate or Record Live Buzzer Press from Finalist
  const handleTriggerBuzz = async (studentId, studentName) => {
    try {
      playBuzzerPress();
      const res = await apiBuzzerPress(studentId, studentName);
      if (res.success) {
        fetchBuzzerState();
        setTenSecondCountdown(10);
        setMessage({ text: `Buzzer Lock Awarded to ${studentName}!`, isError: false });
      } else {
        setMessage({ text: res.error || 'Buzzer lock conflict.', isError: true });
      }
    } catch (err) {
      setMessage({ text: err.message, isError: true });
    }
  };

  // Adjudicate
  const handleAdjudicate = async (outcome, penaltyVal = 0) => {
    try {
      if (outcome === 'correct') playCorrectChime();
      else playAntiCheatBuzzer();

      const res = await apiAdjudicateBuzzer(outcome, penaltyVal, penaltyNote);
      if (res.success) {
        fetchBuzzerState();
        fetchFinalists();
        setMessage({ 
          text: `Adjudicated: ${outcome.toUpperCase()} (${res.delta > 0 ? '+' + res.delta : res.delta} pts). Finalist score: ${res.updatedScore}`, 
          isError: false 
        });
        setPenaltyNote('');
      } else {
        setMessage({ text: res.error || 'Adjudication failed.', isError: true });
      }
    } catch (err) {
      setMessage({ text: err.message, isError: true });
    }
  };

  // Reset for Next Question
  const handleResetForNext = async () => {
    try {
      await apiResetBuzzer();
      fetchBuzzerState();
      setTenSecondCountdown(10);
      setMessage({ text: 'Buzzer console reset. Ready for next decider question.', isError: false });
    } catch {}
  };

  const currentQIndex = buzzerState.activeQuestionIndex || 0;
  const currentQ = questions[currentQIndex % (questions.length || 1)];

  const finalist1 = finalists[0] || { studentId: 'CANDIDATE-01', fullName: 'Finalist 01' };
  const finalist2 = finalists[1] || { studentId: 'CANDIDATE-02', fullName: 'Finalist 02' };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 mb-2">
            <Trophy className="w-3.5 h-3.5 text-blue-400" />
            <span>Round 04 Championship Final</span>
          </div>
          <h3 className={`text-xl font-heading font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Buzzer Adjudication Console
          </h3>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-0.5`}>
            2-Finalist sudden death decider • First buzz receives 10s opportunity • +1 Correct / -0.5 Wrong.
          </p>
        </div>

        <button
          onClick={handleResetForNext}
          className="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-heading font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Next Decider Question</span>
        </button>
      </div>

      {message.text && (
        <div className={`p-3.5 rounded-xl text-xs flex items-center justify-between ${
          message.isError ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300' : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage({ text: '', isError: false })} className="text-slate-400 hover:text-white">×</button>
        </div>
      )}

      {/* Two Finalists Arena Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Finalist Pod 1 */}
        <div className={`p-6 rounded-2xl border transition-all ${
          buzzerState.lockedStudentId === finalist1.studentId
            ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/50 shadow-2xl scale-[1.01]'
            : isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400">
              Pod A • Finalist 01
            </span>
            {buzzerState.lockedStudentId === finalist1.studentId && (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500 text-white font-mono font-black text-[10px] animate-pulse">
                BUZZED FIRST!
              </span>
            )}
          </div>

          <div className="py-4">
            <h4 className="text-lg font-heading font-bold text-white">{finalist1.fullName}</h4>
            <div className="text-xs font-mono text-slate-400">{finalist1.studentId}</div>
          </div>

          <button
            onClick={() => handleTriggerBuzz(finalist1.studentId, finalist1.fullName)}
            disabled={buzzerState.status === 'buzzed'}
            className={`w-full py-3 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
              buzzerState.lockedStudentId === finalist1.studentId
                ? 'bg-blue-600 text-white shadow-blue-500/50'
                : 'bg-black/50 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 hover:border-blue-400'
            } disabled:opacity-40`}
          >
            <Zap className="w-4 h-4 text-yellow-300" />
            <span>Simulate Pod A Buzzer Click</span>
          </button>
        </div>

        {/* Finalist Pod 2 */}
        <div className={`p-6 rounded-2xl border transition-all ${
          buzzerState.lockedStudentId === finalist2.studentId
            ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/50 shadow-2xl scale-[1.01]'
            : isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
              Pod B • Finalist 02
            </span>
            {buzzerState.lockedStudentId === finalist2.studentId && (
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500 text-white font-mono font-black text-[10px] animate-pulse">
                BUZZED FIRST!
              </span>
            )}
          </div>

          <div className="py-4">
            <h4 className="text-lg font-heading font-bold text-white">{finalist2.fullName}</h4>
            <div className="text-xs font-mono text-slate-400">{finalist2.studentId}</div>
          </div>

          <button
            onClick={() => handleTriggerBuzz(finalist2.studentId, finalist2.fullName)}
            disabled={buzzerState.status === 'buzzed'}
            className={`w-full py-3 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
              buzzerState.lockedStudentId === finalist2.studentId
                ? 'bg-cyan-600 text-white shadow-cyan-500/50'
                : 'bg-black/50 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400'
            } disabled:opacity-40`}
          >
            <Zap className="w-4 h-4 text-yellow-300" />
            <span>Simulate Pod B Buzzer Click</span>
          </button>
        </div>

      </div>

      {/* Decider Question & Authoritative 10s Timer */}
      <div className={`p-6 sm:p-7 rounded-2xl border ${
        isDark ? 'bg-gradient-to-br from-[#0c142c] to-[#040814] border-blue-500/40' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <Gavel className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-mono font-bold text-white">
              Grand Final Decider #{currentQIndex + 1}
            </span>
          </div>

          {/* 10-Second Clock */}
          <div className={`px-4 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-mono font-bold ${
            tenSecondCountdown <= 3 
              ? 'bg-rose-500/25 border-rose-500 text-rose-300 animate-pulse' 
              : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
          }`}>
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Authoritative Answer Clock: {tenSecondCountdown}s</span>
          </div>
        </div>

        {currentQ ? (
          <div className="space-y-4">
            <span className="text-xs font-mono text-blue-400">{currentQ.subjectName} • {currentQ.difficulty}</span>
            <h4 className="text-lg sm:text-xl font-heading font-bold text-white leading-relaxed">
              {currentQ.question}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {currentQ.options.map((opt, oIdx) => (
                <div
                  key={oIdx}
                  className={`p-3.5 rounded-xl text-xs font-medium border flex items-center gap-3 ${
                    oIdx === currentQ.correct
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200 font-bold'
                      : 'bg-black/40 border-white/10 text-slate-300'
                  }`}
                >
                  <span className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center font-mono">
                    {String.fromCharCode(65 + oIdx)}
                  </span>
                  <span>{opt}</span>
                </div>
              ))}
            </div>

            {currentQ.explanation && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
                <strong className="text-white">Explanation:</strong> {currentQ.explanation}
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 text-xs">
            No decider questions found for Round 4. Add questions with Round = 4 in Question Bank.
          </div>
        )}

        {/* Adjudication Controls Deck */}
        <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
          <div className="text-xs font-heading font-bold text-slate-300">
            Adjudicate Locked Contender: <span className="text-white font-mono">{buzzerState.lockedStudentName || 'None Currently Buzzed'}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <button
              onClick={() => handleAdjudicate('correct')}
              disabled={!buzzerState.lockedStudentId}
              className="py-3 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-heading font-bold flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer disabled:opacity-40"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Correct (+1)</span>
            </button>

            <button
              onClick={() => handleAdjudicate('incorrect')}
              disabled={!buzzerState.lockedStudentId}
              className="py-3 px-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-heading font-bold flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer disabled:opacity-40"
            >
              <XCircle className="w-4 h-4" />
              <span>Wrong (-0.5)</span>
            </button>

            <button
              onClick={() => handleAdjudicate('timeout')}
              disabled={!buzzerState.lockedStudentId}
              className="py-3 px-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-heading font-bold flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer disabled:opacity-40"
            >
              <Clock className="w-4 h-4" />
              <span>Timeout (0)</span>
            </button>

            <button
              onClick={() => handleAdjudicate('pass')}
              disabled={!buzzerState.lockedStudentId}
              className="py-3 px-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-heading font-bold flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer disabled:opacity-40"
            >
              <span>Pass Turn</span>
            </button>

            <button
              onClick={() => handleAdjudicate('warning', 1.0)}
              disabled={!buzzerState.lockedStudentId}
              className="py-3 px-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-heading font-bold flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer disabled:opacity-40"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Penalty (-1)</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
