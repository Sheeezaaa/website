import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Gavel, 
  Scale, 
  PhoneOff, 
  IdCard, 
  Users, 
  User,
  Clock, 
  AlertTriangle, 
  Sparkles, 
  Printer, 
  CheckCircle2 
} from 'lucide-react';
import { RULES_AND_REGULATIONS } from '../data/competitionData';

const GENERAL_ICON_MAP = {
  User,
  Users,
  IdCard,
  PhoneOff,
  ShieldAlert,
  Gavel,
  Clock,
};

export default function Rules({ rules: propRules }) {
  const [activeTab, setActiveTab] = useState('all');
  
  // Safe merged fallback so missing fields never crash the UI
  const rulesData = {
    generalRules: (propRules && propRules.generalRules && propRules.generalRules.length > 0) 
      ? propRules.generalRules 
      : RULES_AND_REGULATIONS.generalRules,
    tieBreakerRules: (propRules && propRules.tieBreakerRules && propRules.tieBreakerRules.length > 0)
      ? propRules.tieBreakerRules
      : RULES_AND_REGULATIONS.tieBreakerRules,
    disqualificationRules: (propRules && propRules.disqualificationRules && propRules.disqualificationRules.length > 0)
      ? propRules.disqualificationRules
      : RULES_AND_REGULATIONS.disqualificationRules,
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section id="rules" className="py-20 lg:py-24 relative overflow-hidden bg-[#080d1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-heading font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 mb-4">
            <Scale className="w-3.5 h-3.5" />
            <span>Code of Conduct & Integrity</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-slate-900 dark:text-white mb-4">
            Rules & <span className="text-[#3b82f6]">Regulations</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            Strict collegiate ethics ensure an unbiased playing field. Please review every clause before the tournament.
          </p>
        </div>

        {/* Filter Controls & Printable Trigger */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12 pb-6 border-b border-slate-200 dark:border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Rules' },
              { id: 'general', label: 'General Rules' },
              { id: 'tiebreaker', label: 'Tie-Breaker Rules' },
              { id: 'disqualification', label: 'Disqualification Rules' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-heading font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#2563eb] text-white font-bold shadow-md'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-heading font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-all cursor-pointer"
            title="Print Official Rulebook"
          >
            <Printer className="w-3.5 h-3.5 text-blue-500" />
            <span>Print Rulebook</span>
          </button>
        </div>

        {/* SECTION 1: GENERAL RULES */}
        {(activeTab === 'all' || activeTab === 'general') && (
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-600/20 border border-blue-300 dark:border-blue-500/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-heading font-black text-slate-900 dark:text-white">General Rules</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Regulations governing individual candidates</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {rulesData.generalRules.map((rule, idx) => {
                const Icon = GENERAL_ICON_MAP[rule.icon] || CheckCircle2;
                return (
                  <div 
                    key={idx}
                    className="p-6 rounded-2xl bg-white dark:bg-[#0b1020]/90 border border-slate-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500/40 transition-all flex flex-col justify-between shadow-sm"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-black/40 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-heading font-bold text-slate-900 dark:text-white mb-2">
                        {rule.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {rule.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-white/5 mt-4 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">
                      Clause 0{idx + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 2: TIE-BREAKER RULES */}
        {(activeTab === 'all' || activeTab === 'tiebreaker') && (
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
                <Gavel className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-heading font-black text-slate-900 dark:text-white">Tie-Breaker Rules</h3>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Deterministic sudden-death tie resolution</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {rulesData.tieBreakerRules.map((tb, idx) => (
                <div 
                  key={idx}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-amber-200 dark:border-amber-500/30 shadow-sm hover:border-amber-400 transition-all"
                >
                  <div className="inline-block px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 font-mono text-xs font-bold mb-3">
                    {tb.step}
                  </div>
                  <h4 className="text-sm font-heading font-bold text-slate-900 dark:text-white mb-2">
                    {tb.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {tb.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 3: DISQUALIFICATION RULES */}
        {(activeTab === 'all' || activeTab === 'disqualification') && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 border border-rose-300 dark:border-rose-500/40 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-sm">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-heading font-black text-slate-900 dark:text-white">Disqualification Rules</h3>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">Immediate termination infractions</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {rulesData.disqualificationRules.map((dq, idx) => (
                <div 
                  key={idx}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-rose-200 dark:border-rose-500/30 shadow-sm hover:border-rose-400 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0 border border-rose-200 dark:border-rose-500/30">
                      <AlertTriangle className="w-4 h-4" />
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-heading font-bold text-slate-900 dark:text-white">
                        {dq.reason}
                      </h4>

                      <div className="inline-block text-[11px] font-mono font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2.5 py-0.5 rounded-md border border-rose-300 dark:border-rose-500/30">
                        Penalty: {dq.severity}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                        {dq.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
