import React, { useState, useEffect } from 'react';
import { 
  User, 
  IdCard, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Printer, 
  Zap, 
  LogOut, 
  Calendar, 
  MapPin, 
  Clock, 
  Search,
  ArrowRight,
  Sparkles,
  Trophy,
  ShieldCheck,
  Bell,
  Lock,
  Eye,
  EyeOff,
  Radio,
  RotateCcw,
  BookOpen,
  Award,
  ChevronRight,
  ShieldAlert,
  AlertTriangle,
  Maximize2,
  Ban
} from 'lucide-react';
import { 
  apiStudentLogin, 
  apiStudentResetPassword, 
  apiGetStudentQuizStatus, 
  apiStartQuizAttempt, 
  apiSubmitQuizAnswer, 
  apiSkipQuizQuestion, 
  apiFinishQuizAttempt,
  apiGetNotifications,
  apiMarkNotificationsRead,
  apiGetAnnouncements,
  apiGetLeaderboard,
  apiReportProctorInfraction,
  setStudentAuthToken,
  getStudentAuthToken
} from '../utils/api';
import { getLoggedInStudent, setLoggedInStudent } from '../utils/storage';
import { playCorrectChime, playAntiCheatBuzzer, playDisqualificationSiren } from '../utils/soundEffects';

export default function StudentPortal({ 
  isOpen, 
  onClose, 
  onOpenRegister 
}) {
  const [currentUser, setCurrentUser] = useState(() => getLoggedInStudent());
  const [authMode, setAuthMode] = useState('login'); // 'login', 'forgot'
  
  // Login Form States
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Reset Password States
  const [resetId, setResetId] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetPass, setResetPass] = useState('');
  const [resetMessage, setResetMessage] = useState({ text: '', isError: false });

  // Dashboard Data States
  const [studentStatus, setStudentStatus] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [myLeaderboardRank, setMyLeaderboardRank] = useState(null);
  const [showPassModal, setShowPassModal] = useState(false);

  // Active Quiz Attempt Engine States
  const [activeQuizAttempt, setActiveQuizAttempt] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizTimeRemaining, setQuizTimeRemaining] = useState(30);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [quizResultSummary, setQuizResultSummary] = useState(null);
  const [quizError, setQuizError] = useState('');

  // Anti-Cheating & Browser Lock States
  const [violationCount, setViolationCount] = useState(0);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [violationReason, setViolationReason] = useState('');
  const [isDisqualified, setIsDisqualified] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Full Screen Request Helper
  const requestFullScreen = async () => {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullScreen(true);
      }
    } catch {}
  };

  const exitFullScreen = async () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
        setIsFullScreen(false);
      }
    } catch {}
  };

  // Anti-Cheat Violation Handler
  const recordAntiCheatViolation = (reason = 'Tab switch or external application window detected.', infractionType = 'TAB_SWITCH') => {
    if (!activeQuizAttempt || isDisqualified) return;
    try {
      playAntiCheatBuzzer();
    } catch {}
    setViolationReason(reason);
    setShowViolationModal(true);

    // Report infraction live to Admin (Triggers Admin Siren & Alert with Student Name and Email)
    apiReportProctorInfraction(
      infractionType,
      reason,
      activeQuizAttempt?.roundNumber || 1
    ).catch(() => {});

    setViolationCount((prev) => {
      const nextCount = prev + 1;
      if (nextCount >= 3) {
        try {
          playDisqualificationSiren();
        } catch {}
        setIsDisqualified(true);
        setTimeout(() => {
          handleAutoFinishAttempt(true);
        }, 1500);
      }
      return nextCount;
    });
  };

  // Dedicated Anti-Cheat & Browser Lock Effect
  useEffect(() => {
    if (!activeQuizAttempt || isDisqualified) return;

    // 1. Detect Tab Switch (Visibility API)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordAntiCheatViolation('Tab switched! Leaving the quiz tab to open another tab or browser is strictly forbidden.');
      }
    };

    // 2. Detect Window Focus Loss (Clicking on another window/app/browser)
    const handleWindowBlur = () => {
      recordAntiCheatViolation('Window focus lost! Switching to another browser, window, or application is prohibited.');
    };

    // 3. Detect Fullscreen Exit
    const handleFullscreenChange = () => {
      const inFull = !!document.fullscreenElement;
      setIsFullScreen(inFull);
      if (!inFull && activeQuizAttempt && !isDisqualified) {
        recordAntiCheatViolation('Full-screen mode exited! The quiz environment must remain in full-screen lockdown.');
      }
    };

    // 4. Block Navigation & DevTools Shortcuts
    const handleKeyDown = (e) => {
      if (e.key === 'F12') {
        e.preventDefault();
        recordAntiCheatViolation('Developer tools / F12 shortcut is prohibited.');
        return false;
      }
      if (e.ctrlKey || e.metaKey) {
        const blockedKeys = ['c', 'v', 'x', 't', 'n', 'w', 'u', 'p', 'i', 'j', 'r'];
        if (blockedKeys.includes(e.key.toLowerCase())) {
          e.preventDefault();
          recordAntiCheatViolation(`Keyboard shortcut (Ctrl+${e.key.toUpperCase()}) is disabled during examination.`);
          return false;
        }
      }
      if (e.altKey && (e.key === 'Tab' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        recordAntiCheatViolation('Alt key window navigation is disabled.');
        return false;
      }
    };

    // 5. Block Context Menu & Selection Copy
    const handleContextMenu = (e) => {
      e.preventDefault();
    };
    const handleCopy = (e) => {
      e.preventDefault();
      recordAntiCheatViolation('Copying question text is prohibited.');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('copy', handleCopy);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('copy', handleCopy);
    };
  }, [activeQuizAttempt, isDisqualified]);

  // Synchronize student data upon open or user state change
  useEffect(() => {
    if (isOpen && currentUser) {
      loadStudentDashboardData();
    }
  }, [isOpen, currentUser]);

  const loadStudentDashboardData = async () => {
    try {
      const [statusData, annList, notifList, lbData] = await Promise.all([
        apiGetStudentQuizStatus(),
        apiGetAnnouncements(),
        apiGetNotifications(),
        apiGetLeaderboard(),
      ]);

      if (statusData) setStudentStatus(statusData);
      if (annList) setAnnouncements(annList.filter((a) => a.isPublished));
      if (notifList) setNotifications(notifList);

      if (lbData && lbData.leaderboard && currentUser) {
        const myEntry = lbData.leaderboard.find((l) => l.studentId === currentUser.studentId);
        if (myEntry) setMyLeaderboardRank(myEntry.rank);
      }
    } catch (err) {
      console.error('Error fetching student dashboard data:', err);
    }
  };

  // Timer countdown for active quiz
  useEffect(() => {
    if (!activeQuizAttempt || activeQuizAttempt.status !== 'in_progress') return;

    const interval = setInterval(() => {
      const now = Date.now();
      const deadline = new Date(activeQuizAttempt.expiresAt).getTime();
      const diffSeconds = Math.max(0, Math.floor((deadline - now) / 1000));

      setQuizTimeRemaining(diffSeconds);

      if (diffSeconds <= 0) {
        clearInterval(interval);
        handleAutoFinishAttempt();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeQuizAttempt]);

  if (!isOpen) return null;

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!identifier.trim() || !password) {
      setLoginError('Student Registration ID / Email and password are required.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await apiStudentLogin(identifier.trim(), password);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        setLoggedInStudent(res.user);
        setIdentifier('');
        setPassword('');
      } else {
        setLoginError(res.error || 'Invalid credentials.');
      }
    } catch (err) {
      setLoginError(err.message || 'Login connection failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetMessage({ text: '', isError: false });
    try {
      const res = await apiStudentResetPassword(resetId, resetEmail, resetPass);
      if (res.success) {
        setResetMessage({ text: res.message, isError: false });
        setTimeout(() => {
          setAuthMode('login');
          setResetMessage({ text: '', isError: false });
        }, 2000);
      } else {
        setResetMessage({ text: res.error, isError: true });
      }
    } catch (err) {
      setResetMessage({ text: err.message, isError: true });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoggedInStudent(null);
    setStudentAuthToken('');
    setStudentStatus(null);
    setActiveQuizAttempt(null);
  };

  // Start Official Quiz Attempt
  const handleStartQuiz = async (roundNumber = 1) => {
    setQuizError('');
    setQuizResultSummary(null);
    setViolationCount(0);
    setShowViolationModal(false);
    setIsDisqualified(false);
    try {
      const res = await apiStartQuizAttempt(roundNumber);
      if (res.success && res.attempt) {
        setActiveQuizAttempt(res.attempt);
        setCurrentQIndex(0);
        setSelectedOption(null);
        setQuizTimeRemaining(res.attempt.timeLimitSeconds || 30);
        requestFullScreen();
      } else {
        setQuizError(res.error || 'Failed to start quiz attempt.');
      }
    } catch (err) {
      setQuizError(err.message || 'Error initializing round attempt.');
    }
  };

  // Submit Answer to Active Question
  const handleSubmitAnswer = async () => {
    if (!activeQuizAttempt || selectedOption === null) return;
    const currentQ = activeQuizAttempt.questions[currentQIndex];
    if (!currentQ) return;

    setIsSubmittingAnswer(true);
    try {
      const res = await apiSubmitQuizAnswer(activeQuizAttempt.id, currentQ.id, selectedOption);
      if (res.success) {
        playCorrectChime();
        if (res.isFinished || currentQIndex + 1 >= activeQuizAttempt.questions.length) {
          // Attempt finalized
          exitFullScreen();
          setQuizResultSummary({
            score: res.currentScore,
            totalQuestions: activeQuizAttempt.questions.length,
          });
          setActiveQuizAttempt(null);
          loadStudentDashboardData();
        } else {
          // Advance to next question
          setCurrentQIndex((prev) => prev + 1);
          setSelectedOption(null);
        }
      } else {
        setQuizError(res.error || 'Answer submission failed.');
      }
    } catch (err) {
      setQuizError(err.message || 'Submission error.');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  // Skip Question
  const handleSkipQuestion = async () => {
    if (!activeQuizAttempt) return;
    const currentQ = activeQuizAttempt.questions[currentQIndex];
    if (!currentQ) return;

    try {
      await apiSkipQuizQuestion(activeQuizAttempt.id, currentQ.id);
      if (currentQIndex + 1 >= activeQuizAttempt.questions.length) {
        handleAutoFinishAttempt();
      } else {
        setCurrentQIndex((prev) => prev + 1);
        setSelectedOption(null);
      }
    } catch {}
  };

  // Auto Finish Attempt on Timer Expiry or Disqualification
  const handleAutoFinishAttempt = async (disqualified = false) => {
    if (!activeQuizAttempt) return;
    exitFullScreen();
    try {
      const res = await apiFinishQuizAttempt(activeQuizAttempt.id);
      setQuizResultSummary({
        score: disqualified ? 0 : (res.finalScore || 0),
        totalQuestions: activeQuizAttempt.questions.length,
        disqualified,
      });
      setActiveQuizAttempt(null);
      loadStudentDashboardData();
    } catch {}
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b1020] border border-blue-500/40 w-full max-w-4xl max-h-[92vh] rounded-2xl flex flex-col relative shadow-2xl overflow-hidden">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <IdCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-heading font-black text-white flex items-center gap-2">
                <span>Contestant Dashboard</span>
                {currentUser && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {currentUser.id}
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">
                {currentUser ? `Enrolled: ${currentUser.fullName} (${currentUser.studentId})` : 'Individual Student Authentication & Tournament Arena'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentUser && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg text-xs font-heading font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Log Out Contestant"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              aria-label="Close Portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">

          {/* ======================================================== */}
          {/* SECTION 1: AUTHENTICATION (IF NOT LOGGED IN) */}
          {/* ======================================================== */}
          {!currentUser ? (
            <div className="max-w-md mx-auto py-6">
              
              {authMode === 'login' ? (
                <div>
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto mb-3">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-heading font-bold text-white">
                      Contestant Portal Login
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Enter your Student Registration ID and account password to enter your tournament console.
                    </p>
                  </div>

                  {loginError && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-heading font-semibold text-slate-300 mb-1.5">
                        Student Registration ID or Email
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. FA21-BCS-042"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-white text-sm font-medium focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-heading font-semibold text-slate-300">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setAuthMode('forgot')}
                          className="text-[11px] text-blue-400 hover:text-blue-300"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-white text-sm font-medium focus:border-blue-500 focus:outline-none pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoggingIn}
                      className="w-full py-3 rounded-xl bg-[#2563eb] hover:bg-blue-600 text-white font-heading font-bold text-sm shadow-lg hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isLoggingIn ? <span>Authenticating...</span> : <span>Login to Dashboard</span>}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>

                  <div className="mt-6 pt-5 border-t border-white/10 text-center">
                    <p className="text-xs text-slate-400">
                      Not registered yet for the 2026 Championship?{' '}
                      <button
                        onClick={() => {
                          onClose();
                          onOpenRegister && onOpenRegister();
                        }}
                        className="text-blue-400 hover:text-blue-300 font-bold underline"
                      >
                        Register Solo Now
                      </button>
                    </p>
                  </div>
                </div>
              ) : (
                /* FORGOT PASSWORD FORM */
                <div>
                  <div className="text-center mb-6">
                    <h4 className="text-xl font-heading font-bold text-white">
                      Reset Contestant Password
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Verify your Student Registration ID and registered university email to set a new password.
                    </p>
                  </div>

                  {resetMessage.text && (
                    <div className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                      resetMessage.isError 
                        ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300' 
                        : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                    }`}>
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{resetMessage.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-heading font-semibold text-slate-300 mb-1">
                        Student Registration ID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. FA21-BCS-042"
                        value={resetId}
                        onChange={(e) => setResetId(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-heading font-semibold text-slate-300 mb-1">
                        Registered University Email
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. hamza@student.comsats.edu.pk"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-heading font-semibold text-slate-300 mb-1">
                        New Password (min 6 characters)
                      </label>
                      <input
                        type="password"
                        placeholder="New strong password"
                        value={resetPass}
                        onChange={(e) => setResetPass(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-sm"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setAuthMode('login')}
                        className="px-4 py-2.5 rounded-xl bg-white/10 text-slate-300 text-xs font-heading font-semibold hover:bg-white/20"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-[#2563eb] text-white text-xs font-heading font-bold hover:bg-blue-600"
                      >
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          ) : (
            /* ======================================================== */
            /* SECTION 2: CONTESTANT DASHBOARD (LOGGED IN) */
            /* ======================================================== */
            <div className="space-y-6">
              
              {/* Top Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                
                <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                  <div className="text-[11px] font-heading font-semibold text-slate-400">
                    Registration Status
                  </div>
                  <div className="text-sm font-heading font-bold text-emerald-400 flex items-center gap-1.5 mt-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{currentUser.registrationStatus || 'Approved'}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Ref: {currentUser.id}</div>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                  <div className="text-[11px] font-heading font-semibold text-slate-400">
                    Tournament Points
                  </div>
                  <div className="text-xl font-heading font-black text-blue-400 mt-0.5">
                    {studentStatus?.totalScore || 0} <span className="text-xs text-slate-400 font-normal">pts</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Verified server tally</div>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                  <div className="text-[11px] font-heading font-semibold text-slate-400">
                    Leaderboard Rank
                  </div>
                  <div className="text-xl font-heading font-black text-amber-400 mt-0.5 flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>{myLeaderboardRank ? `#${myLeaderboardRank}` : '--'}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Across all contenders</div>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                  <div className="text-[11px] font-heading font-semibold text-slate-400">
                    Admit Card Pass
                  </div>
                  <button
                    onClick={() => setShowPassModal(true)}
                    className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-heading font-bold text-blue-400 hover:text-blue-300"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>View / Print Pass</span>
                  </button>
                  <div className="text-[10px] text-slate-500">Official Exam Admit</div>
                </div>

              </div>

              {/* ACTIVE QUIZ ARENA OR ACTIVE ROUND ACTION */}
              {activeQuizAttempt ? (
                /* LIVE QUIZ ATTEMPT INTERFACE */
                <div className="p-5 sm:p-7 rounded-2xl bg-gradient-to-br from-[#0c1630] to-[#080d1a] border-2 border-blue-500/60 shadow-2xl space-y-6">
                  
                  {/* Quiz Header Bar with Anti-Cheat Live Monitoring */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
                        Round 0{activeQuizAttempt.roundNumber} In Progress
                      </span>
                    </div>

                    {/* Live Anti-Cheat Monitor Indicator */}
                    <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-rose-950/40 border border-rose-500/40 text-[11px] text-rose-300">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                      <span className="font-semibold hidden sm:inline">Anti-Cheat Lockdown Active</span>
                      <span className="font-semibold sm:hidden">Lockdown</span>
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold text-[10px]">
                        Strikes: {violationCount}/3
                      </span>
                    </div>

                    {/* Full Screen & Server Authoritative Timer Countdown */}
                    <div className="flex items-center gap-2">
                      {!isFullScreen && (
                        <button
                          type="button"
                          onClick={requestFullScreen}
                          className="px-2.5 py-1.5 rounded-xl bg-blue-950/60 border border-blue-500/40 text-blue-400 hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Enter Full Screen Mode"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Fullscreen</span>
                        </button>
                      )}
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-white/20">
                        <Clock className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                        <span className="font-mono font-black text-sm text-amber-300">
                          {quizTimeRemaining}s Remaining
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Question Prompt */}
                  {activeQuizAttempt.questions[currentQIndex] && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Question {currentQIndex + 1} of {activeQuizAttempt.questions.length}</span>
                        <span className="font-mono text-blue-400">{activeQuizAttempt.questions[currentQIndex].subjectName}</span>
                      </div>

                      <h4 className="text-base sm:text-lg font-heading font-bold text-white leading-relaxed">
                        {activeQuizAttempt.questions[currentQIndex].question}
                      </h4>

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {activeQuizAttempt.questions[currentQIndex].options.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => setSelectedOption(oIdx)}
                            className={`p-4 rounded-xl text-left text-xs font-medium border transition-all cursor-pointer flex items-center gap-3 ${
                              selectedOption === oIdx
                                ? 'bg-blue-600/30 border-blue-400 text-white shadow-md'
                                : 'bg-black/40 border-white/10 text-slate-300 hover:border-white/30 hover:bg-white/5'
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold shrink-0 ${
                              selectedOption === oIdx ? 'bg-blue-500 text-white' : 'bg-white/10 text-slate-400'
                            }`}>
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span className="leading-snug">{opt}</span>
                          </button>
                        ))}
                      </div>

                      {quizError && (
                        <p className="text-xs text-rose-400 flex items-center gap-1.5 mt-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{quizError}</span>
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <button
                          type="button"
                          onClick={handleSkipQuestion}
                          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-heading font-semibold transition-colors cursor-pointer"
                        >
                          Skip Question
                        </button>

                        <button
                          type="button"
                          onClick={handleSubmitAnswer}
                          disabled={selectedOption === null || isSubmittingAnswer}
                          className="px-7 py-2.5 rounded-xl bg-[#2563eb] hover:bg-blue-600 text-white text-xs font-heading font-bold shadow-lg hover:shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                        >
                          {isSubmittingAnswer ? <span>Evaluating...</span> : <span>Confirm & Submit</span>}
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              ) : (
                /* TOURNAMENT ROUND LAUNCHER */
                <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0b1020] to-[#040814] border border-blue-500/30 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                        {studentStatus?.activeRound?.stageBadge || 'Tournament Arena'}
                      </span>
                      <h4 className="text-lg font-heading font-bold text-white mt-1.5">
                        {studentStatus?.activeRound?.title || 'Screening Round (MCQs)'}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {studentStatus?.activeRound?.qualificationRule || 'Top 80% of participating students qualify.'}
                      </p>
                    </div>

                    <button
                      onClick={() => handleStartQuiz(studentStatus?.activeRound?.roundNumber || 1)}
                      className="px-6 py-3 rounded-xl bg-[#2563eb] hover:bg-blue-600 text-white text-xs font-heading font-bold shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
                    >
                      <Zap className="w-4 h-4 text-yellow-300" />
                      <span>Take Active Round Quiz</span>
                    </button>
                  </div>

                  {quizResultSummary && (
                    <div className={`p-4 rounded-xl border text-xs flex items-center justify-between animate-fadeIn ${
                      quizResultSummary.disqualified
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                        : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    }`}>
                      <div>
                        {quizResultSummary.disqualified ? (
                          <>
                            <strong className="text-rose-400">Attempt Disqualified for Malpractice:</strong> Multiple tab switching or external application violations detected.
                          </>
                        ) : (
                          <>
                            <strong>Attempt Completed!</strong> You scored {quizResultSummary.score} / {quizResultSummary.totalQuestions} points.
                          </>
                        )}
                      </div>
                      <span className="font-mono font-bold text-white">
                        {quizResultSummary.disqualified ? 'Disqualified (0 Pts)' : 'Score Saved'}
                      </span>
                    </div>
                  )}

                  {quizError && (
                    <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{quizError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Student Profile Details & Scorecard */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Profile Information */}
                <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                  <h5 className="font-heading font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-blue-400" />
                    <span>Contestant Profile</span>
                  </h5>
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-slate-400">Full Name</span>
                      <strong className="text-white">{currentUser.fullName}</strong>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-slate-400">Student ID</span>
                      <strong className="font-mono text-white">{currentUser.studentId}</strong>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-slate-400">University</span>
                      <span className="truncate max-w-[200px] text-right">{currentUser.universityName || 'COMSATS University'}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-slate-400">Campus & Region</span>
                      <span>{currentUser.campus} ({currentUser.region})</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-slate-400">Degree & Semester</span>
                      <span>{currentUser.degreeProgram} • {currentUser.semester}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Official Email</span>
                      <span className="truncate max-w-[190px] text-right font-mono text-[11px]">{currentUser.email}</span>
                    </div>
                  </div>
                </div>

                {/* Round-Wise Official Scorecard */}
                <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                  <h5 className="font-heading font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Round-Wise Verified Scorecard</span>
                  </h5>
                  <div className="space-y-2 text-xs">
                    {[1, 2, 3, 4].map((rNum) => {
                      const match = (studentStatus?.roundScores || []).find((s) => s.roundNumber === rNum);
                      return (
                        <div key={rNum} className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                          <div>
                            <span className="font-heading font-bold text-slate-200">Round 0{rNum}</span>
                            <span className="text-[10px] text-slate-400 ml-2">
                              {rNum === 1 ? 'Screening MCQs' : rNum === 2 ? 'Core CS' : rNum === 3 ? 'Rapid Fire' : 'Buzzer Finale'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-blue-400">
                              {match ? `${match.score} pts` : '--'}
                            </span>
                            {match && match.isQualified && (
                              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                Qualified
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Tournament Announcements & Notifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Announcements */}
                <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                  <h5 className="font-heading font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span>Organizer Bulletins</span>
                  </h5>
                  {announcements.length === 0 ? (
                    <p className="text-xs text-slate-500">No active bulletins published yet.</p>
                  ) : (
                    <div className="space-y-2.5 max-h-48 overflow-y-auto">
                      {announcements.map((a) => (
                        <div key={a.id} className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">{a.title}</span>
                            <span className="text-[10px] font-mono text-blue-400">{a.category}</span>
                          </div>
                          <p className="text-slate-300 leading-snug">{a.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* In-App Notifications Feed */}
                <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                  <h5 className="font-heading font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-yellow-400" />
                    <span>My In-App Notifications</span>
                  </h5>
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500">No new notifications for your account.</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {notifications.map((n) => (
                        <div key={n.id} className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs">
                          <div className="font-semibold text-slate-200">{n.title}</div>
                          <p className="text-slate-400 text-[11px] mt-0.5">{n.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

        </div>

      </div>

      {/* =========================================================================
          ANTI-CHEAT VIOLATION LOCKDOWN MODAL (Pore screen par warning & lockout)
          ========================================================================= */}
      {showViolationModal && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#1a0808] to-[#0d0404] border-2 border-rose-600 shadow-2xl shadow-rose-950 text-center relative overflow-hidden">
            {/* Pulsating background glow */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-600/25 rounded-full blur-3xl pointer-events-none" />

            {/* Warning Icon */}
            <div className="w-20 h-20 rounded-2xl bg-rose-600/20 border-2 border-rose-500 flex items-center justify-center text-rose-500 mx-auto mb-4 animate-bounce">
              {isDisqualified ? <Ban className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10 text-rose-500" />}
            </div>

            <h3 className="text-xl sm:text-2xl font-heading font-black text-white tracking-tight uppercase">
              {isDisqualified ? 'Examination Terminated' : 'Cheating Attempt Detected!'}
            </h3>

            <p className="text-xs text-rose-300 font-semibold mt-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30">
              {violationReason || 'Tab switch or external application window detected!'}
            </p>

            <div className="mt-4 p-4 rounded-2xl bg-black/60 border border-rose-500/30 text-left space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">Violation Strike:</span>
                <span className="font-mono font-black text-rose-400 text-sm">
                  {Math.min(violationCount, 3)} / 3
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-rose-500 h-full transition-all duration-300"
                  style={{ width: `${(Math.min(violationCount, 3) / 3) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                {isDisqualified ? (
                  <span className="text-rose-400 font-bold">
                    You have exceeded 3 violations. Your quiz attempt has been automatically locked and submitted.
                  </span>
                ) : (
                  <span>
                    <strong>Examination Rule:</strong> You are strictly forbidden from switching browser tabs, opening any other browser or application, minimizing this window, or exiting full screen during the quiz!
                  </span>
                )}
              </p>
            </div>

            {!isDisqualified ? (
              <div className="mt-6 space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowViolationModal(false);
                    requestFullScreen();
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-heading font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>Resume Exam & Re-Enter Fullscreen</span>
                </button>
                <div className="text-[10px] text-slate-400">
                  Next violation will lead to immediate disqualification.
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowViolationModal(false);
                    setActiveQuizAttempt(null);
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Close & View Final Score
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* PRINTABLE ADMIT CARD MODAL */}
      {showPassModal && currentUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0b1020] border-2 border-blue-500/60 p-6 sm:p-8 max-w-lg w-full rounded-2xl shadow-2xl relative text-white space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black">
                  BOB
                </div>
                <div>
                  <h4 className="font-heading font-black text-sm text-blue-400 uppercase tracking-wider">
                    Official Examination Admit Pass
                  </h4>
                  <div className="text-[10px] text-slate-400">Battle of Brains 2026 • Individual Championship</div>
                </div>
              </div>
              <button onClick={() => setShowPassModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-black/50 border border-white/10 rounded-xl p-5 text-xs space-y-3">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-slate-400 font-mono">Pass Reference ID</span>
                <span className="font-mono font-bold text-base text-blue-400">{currentUser.id}</span>
              </div>
              <div><span className="text-slate-400">Student Name:</span> <strong className="text-white block text-sm">{currentUser.fullName}</strong></div>
              <div><span className="text-slate-400">Registration ID:</span> <strong className="text-white block font-mono">{currentUser.studentId}</strong></div>
              <div><span className="text-slate-400">Institution:</span> <span className="text-slate-200 block">{currentUser.universityName || 'COMSATS University Islamabad'}</span></div>
              <div><span className="text-slate-400">Campus & Region:</span> <span className="text-slate-200 block">{currentUser.campus} • {currentUser.region}</span></div>
              <div><span className="text-slate-400">Department:</span> <span className="text-slate-200 block">{currentUser.degreeProgram} ({currentUser.semester})</span></div>
              <div><span className="text-slate-400">Reporting Time:</span> <span className="text-amber-400 block font-semibold">08:50 AM • Main Auditorium</span></div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setShowPassModal(false)}
                className="px-5 py-2.5 rounded-xl bg-white/10 text-slate-300 text-xs font-heading font-semibold hover:bg-white/20"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="px-6 py-2.5 rounded-xl bg-[#2563eb] text-white text-xs font-heading font-bold hover:bg-blue-600 flex items-center gap-1.5 shadow-lg"
              >
                <Printer className="w-4 h-4" />
                <span>Print Admit Card</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
