import React from 'react';
import { 
  User, 
  IdCard, 
  Target, 
  Cpu, 
  Award,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Trophy,
  Zap,
  BookOpen
} from 'lucide-react';

export default function About({ details }) {
  const organizer = details?.organizer || "Department of Computer Science & Information Technology";
  const university = details?.university || "COMSATS University Islamabad";

  const highlights = [
    {
      icon: Target,
      title: "Individual Excellence",
      desc: "Designed to spotlight personal intellectual mastery, analytical agility, and independent computer science problem solving.",
      badge: "Solo Competitor",
    },
    {
      icon: Cpu,
      title: "Comprehensive CS Scope",
      desc: "Questions rigorously evaluate core syntax, OOP paradigms, asymptotic complexity, network protocols, ACID models, and OS internals.",
      badge: "7 Core Domains",
    },
    {
      icon: Award,
      title: "Official Recognition",
      desc: "Top performers earn university championship shields, merit certificates, and cash honorariums from the Department of Computer Science.",
      badge: "Prestigious Merit",
    },
  ];

  return (
    <section id="about" className="py-20 lg:py-24 relative overflow-hidden bg-[#080d1a]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-heading font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>About The Competition</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-slate-900 dark:text-white mb-4">
            Individual Knowledge & <span className="text-[#3b82f6]">Speed Arena</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            Battle of Brains is the official university individual quiz competition organized by {organizer} at {university}.
          </p>
        </div>

        {/* Narrative Banner */}
        <div className="mb-12 p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0b1020]/90 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl">
          <div className="max-w-4xl mx-auto text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed space-y-4">
            <p>
              The <strong className="text-slate-900 dark:text-white font-bold">Battle of Brains</strong> brings together enrolled undergraduate students to compete individually across four escalating rounds. Every contestant relies solely on their personal intellect, recall speed, and composure under the clock without any teammates or external help.
            </p>
            <p>
              From rapid screening MCQs to rapid-fire queries and the final 1-on-1 buzzer showdown, this tournament is designed to crown the university's premier individual computing champion.
            </p>
          </div>
        </div>

        {/* 3 Full-Width Highlight Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {highlights.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div 
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-[#0b1020]/80 border border-slate-200 dark:border-white/10 hover:border-blue-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      {item.badge}
                    </span>
                  </div>
                  
                  <h4 className="text-base font-heading font-bold text-slate-900 dark:text-white mb-2">{item.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-white/5 mt-5 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Verified Tournament Standard</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* INDIVIDUAL PARTICIPATION CALLOUT BOX (Expanded Full-Width) */}
        <div className="p-6 sm:p-8 rounded-2xl bg-blue-50/70 dark:bg-gradient-to-r dark:from-blue-950/40 dark:via-black/50 dark:to-blue-950/40 border border-blue-200 dark:border-blue-500/30 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-blue-100 dark:border-white/10">
            <h4 className="font-heading font-bold text-base uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              <span>Eligibility & Solo Candidate Requirements</span>
            </h4>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-medium">
              Department of Computer Science
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex items-start gap-3.5 bg-white dark:bg-black/40 p-4 rounded-xl border border-blue-100 dark:border-white/5 shadow-xs">
              <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0 border border-blue-200 dark:border-transparent">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-heading font-bold text-sm text-slate-900 dark:text-white mb-1">
                  Individual (Solo) Format
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Every participant enters alone with their unique Student Registration ID. No teams, no delegating questions, no collaboration permitted.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 bg-white dark:bg-black/40 p-4 rounded-xl border border-blue-100 dark:border-white/5 shadow-xs">
              <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0 border border-blue-200 dark:border-transparent">
                <IdCard className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-heading font-bold text-slate-900 dark:text-white mb-1">
                  Active Enrollment Required
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Open strictly to enrolled BS/MS students across all 8 semesters of CS, SE, IT, AI, Cyber Security, and Data Science.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
