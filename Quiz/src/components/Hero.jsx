import React from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Trophy, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Award,
  Zap,
  IdCard
} from 'lucide-react';
import { HIGHLIGHT_STATS } from '../data/competitionData';

export default function Hero({ onOpenRegister, onOpenStudentPortal, details }) {
  const title = details?.title || "BATTLE OF BRAINS";
  const campusBadge = details?.campusBadge || "NOVEMBER 20, 2026 • COMSATS UNIVERSITY ISLAMABAD";
  const tagline = details?.tagline || "Challenge Your Knowledge, Test Your Intelligence, and Compete to Become the Ultimate Champion!";

  // Format title into first word blue, rest white
  const titleWords = title.split(' ');
  const firstWord = titleWords[0] || "BATTLE";
  const restWords = titleWords.slice(1).join(' ') || "OF BRAINS";

  return (
    <section id="hero" className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 overflow-hidden">
      
      {/* Background University Campus Photograph - Exactly matching VSpark reference */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/images/vspark-hero.jpg')` }}
      ></div>

      {/* Dark Transparent Overlay matching reference website screenshot */}
      <div className="absolute inset-0 bg-black/65 backdrop-blur-[1px]"></div>

      {/* Hero Content */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10 flex flex-col items-center">
        
        {/* Main Massive Heading styled exactly like VSPARK in reference screenshot */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-heading font-black tracking-tight text-white mb-6 leading-tight sm:leading-none break-words">
          <span className="text-[#2563eb]">{firstWord}</span> {restWords}
        </h1>

        {/* Translucent Oval Pill Badge styled identically to VSpark */}
        <div className="inline-flex items-center px-4 sm:px-6 py-1.5 sm:py-2 rounded-full bg-black/50 border border-white/20 backdrop-blur-md shadow-lg mb-8 max-w-full">
          <span className="text-[11px] sm:text-xs md:text-sm font-mono font-bold tracking-wider sm:tracking-widest text-slate-200 uppercase text-center truncate sm:whitespace-normal">
            {campusBadge}
          </span>
        </div>

        {/* Subtitle & Description in dual tone (White + Vibrant Blue) */}
        <div className="max-w-3xl mx-auto mb-10 space-y-2 px-2">
          <p className="text-base sm:text-xl md:text-2xl lg:text-3xl font-heading font-bold text-white tracking-tight leading-snug">
            National-level individual computing quiz championship.
          </p>
          <p className="text-sm sm:text-lg md:text-xl lg:text-2xl font-heading font-semibold text-[#60a5fa] tracking-tight leading-snug">
            {tagline}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 mb-14 w-full sm:w-auto">
          <a
            href="#register"
            onClick={onOpenRegister}
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-[#2563eb] hover:bg-blue-600 active:bg-blue-700 text-white font-heading font-bold text-base shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Register Now</span>
          </a>

          {onOpenStudentPortal && (
            <button
              onClick={onOpenStudentPortal}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-400/40 text-blue-300 font-heading font-bold text-base shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <IdCard className="w-5 h-5 text-blue-400" />
              <span>Student Portal</span>
            </button>
          )}

          <a
            href="#about"
            className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/15 border border-white/20 text-white font-heading font-semibold text-base backdrop-blur-md transition-all cursor-pointer"
          >
            <span>Explore Competition</span>
          </a>
        </div>

        {/* Highlight Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 w-full max-w-4xl text-left">
          {HIGHLIGHT_STATS.map((stat, idx) => (
            <div 
              key={idx} 
              className="p-4 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md hover:border-blue-500/40 transition-all"
            >
              <div className="font-heading font-black text-2xl text-blue-400 mb-0.5">
                {stat.value}
              </div>
              <div className="font-heading font-bold text-xs text-white">
                {stat.label}
              </div>
              <div className="text-[11px] text-slate-400 leading-snug mt-0.5">
                {stat.detail}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Subtle bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#080d1a] to-transparent pointer-events-none"></div>
    </section>
  );
}
