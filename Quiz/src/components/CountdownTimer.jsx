import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  Settings, 
  MapPin, 
  AlertCircle, 
  Check, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { getStoredEventDate, setStoredEventDate } from '../utils/storage';
import { COMPETITION_DETAILS } from '../data/competitionData';

export default function CountdownTimer({ eventDateProp, details }) {
  const [eventDate, setEventDate] = useState(() => eventDateProp || getStoredEventDate());
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [inputDate, setInputDate] = useState(() => {
    const d = eventDateProp || getStoredEventDate();
    return d.slice(0, 16);
  });

  useEffect(() => {
    if (eventDateProp) {
      setEventDate(eventDateProp);
      setInputDate(eventDateProp.slice(0, 16));
    }
  }, [eventDateProp]);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(eventDate).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (isNaN(target) || diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [eventDate]);

  const handleSaveDate = (e) => {
    e.preventDefault();
    if (!inputDate) return;
    const formatted = new Date(inputDate).toISOString();
    setStoredEventDate(formatted);
    setEventDate(formatted);
    setIsConfigOpen(false);
  };

  const handleResetDate = () => {
    const defaultDate = COMPETITION_DETAILS.defaultEventDate;
    setStoredEventDate(defaultDate);
    setEventDate(defaultDate);
    setInputDate(defaultDate.slice(0, 16));
    setIsConfigOpen(false);
  };

  const timeUnits = [
    { label: 'DAYS', value: timeLeft.days },
    { label: 'HOURS', value: timeLeft.hours },
    { label: 'MINUTES', value: timeLeft.minutes },
    { label: 'SECONDS', value: timeLeft.seconds },
  ];

  return (
    <section className="relative py-10 px-4 sm:px-6 lg:px-8 -mt-8 z-20">
      <div className="max-w-5xl mx-auto">
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0b1020]/95 border border-white/15 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: '24s' }} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-heading font-bold text-white flex items-center gap-2">
                  <span>Countdown to Championship</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </h3>
                <p className="text-xs text-slate-300">
                  Target Date: <span className="text-blue-400 font-mono font-medium">{new Date(eventDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </p>
              </div>
            </div>

            {/* Editable Event Date Button */}
            <button
              onClick={() => setIsConfigOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-heading font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              title="Configure Event Date"
            >
              <Settings className="w-3.5 h-3.5 text-blue-400" />
              <span>Configure Event Date</span>
            </button>
          </div>

          {/* Timer Display */}
          {timeLeft.isExpired ? (
            <div className="text-center py-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-sm font-heading font-semibold mb-2">
                <AlertCircle className="w-4 h-4" />
                <span>The configured competition time has commenced!</span>
              </div>
              <p className="text-xs text-slate-400">
                You can configure an upcoming event date using the button above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {timeUnits.map((unit, index) => (
                <div
                  key={index}
                  className="bg-black/50 border border-white/10 rounded-xl p-4 sm:p-5 text-center relative group hover:border-blue-500/50 transition-all shadow-inner"
                >
                  <div className="font-mono font-black text-3xl sm:text-4xl md:text-5xl text-white group-hover:text-blue-400 tracking-tight transition-colors">
                    {String(unit.value).padStart(2, '0')}
                  </div>
                  <div className="text-[11px] sm:text-xs font-heading font-bold text-slate-400 tracking-wider mt-1.5 uppercase">
                    {unit.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer Venue & Timing Notice */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
              <span><strong>Venue:</strong> {COMPETITION_DETAILS.venue}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span><strong>Reporting:</strong> {COMPETITION_DETAILS.reportingTime}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Date Configuration Modal */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0b1020] border border-white/15 p-6 sm:p-8 max-w-md w-full rounded-2xl shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-heading font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <span>Configure Event Date</span>
              </h4>
              <button
                onClick={() => setIsConfigOpen(false)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-6">
              Adjust the live countdown to match the exact scheduled date and time.
            </p>

            <form onSubmit={handleSaveDate} className="space-y-4">
              <div>
                <label className="block text-xs font-heading font-semibold text-slate-300 mb-1.5">
                  Select Event Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={inputDate}
                  onChange={(e) => setInputDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/20 text-white text-sm focus:border-blue-500 focus:outline-none font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleResetDate}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-heading font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsConfigOpen(false)}
                    className="px-3 py-2 rounded-xl text-xs font-heading font-semibold text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#2563eb] text-white font-heading font-bold text-xs hover:bg-blue-600"
                  >
                    Apply Date
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
