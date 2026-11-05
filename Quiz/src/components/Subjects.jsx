import React, { useState } from 'react';
import { 
  Terminal, 
  Boxes, 
  Binary, 
  Database, 
  Network, 
  Workflow, 
  Cpu,
  BrainCircuit,
  Code2,
  GitBranch,
  Sparkles,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  X
} from 'lucide-react';
import { COMPETITION_SUBJECTS } from '../data/competitionData';

// Subject Logo & Visual Domain Mapping (Replaces identical terminal prompts with authentic domain logos)
const SUBJECT_META = {
  dsa: {
    icon: Binary,
    symbol: 'DSA',
    name: 'Data Structures & Algorithms',
    theme: 'bg-purple-500/15 border-purple-500/35 text-purple-400 group-hover:bg-purple-500/25 group-hover:border-purple-400 shadow-purple-950/40',
    badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  },
  oop: {
    icon: Boxes,
    symbol: 'OOP',
    name: 'Object-Oriented Programming',
    theme: 'bg-blue-500/15 border-blue-500/35 text-blue-400 group-hover:bg-blue-500/25 group-hover:border-blue-400 shadow-blue-950/40',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  },
  db: {
    icon: Database,
    symbol: 'DBMS',
    name: 'Database Systems',
    theme: 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400 group-hover:bg-emerald-500/25 group-hover:border-emerald-400 shadow-emerald-950/40',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
  dbms: {
    icon: Database,
    symbol: 'DBMS',
    name: 'Database Systems',
    theme: 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400 group-hover:bg-emerald-500/25 group-hover:border-emerald-400 shadow-emerald-950/40',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
  os: {
    icon: Cpu,
    symbol: 'OS',
    name: 'Operating Systems',
    theme: 'bg-rose-500/15 border-rose-500/35 text-rose-400 group-hover:bg-rose-500/25 group-hover:border-rose-400 shadow-rose-950/40',
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  },
  net: {
    icon: Network,
    symbol: 'NET',
    name: 'Computer Networks',
    theme: 'bg-amber-500/15 border-amber-500/35 text-amber-400 group-hover:bg-amber-500/25 group-hover:border-amber-400 shadow-amber-950/40',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  },
  cn: {
    icon: Network,
    symbol: 'NET',
    name: 'Computer Networks',
    theme: 'bg-amber-500/15 border-amber-500/35 text-amber-400 group-hover:bg-amber-500/25 group-hover:border-amber-400 shadow-amber-950/40',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  },
  ai: {
    icon: BrainCircuit,
    symbol: 'AI',
    name: 'Artificial Intelligence',
    theme: 'bg-fuchsia-500/15 border-fuchsia-500/35 text-fuchsia-400 group-hover:bg-fuchsia-500/25 group-hover:border-fuchsia-400 shadow-fuchsia-950/40',
    badge: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30',
  },
  se: {
    icon: Workflow,
    symbol: 'SE',
    name: 'Software Engineering',
    theme: 'bg-pink-500/15 border-pink-500/35 text-pink-400 group-hover:bg-pink-500/25 group-hover:border-pink-400 shadow-pink-950/40',
    badge: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
  },
  pf: {
    icon: Code2,
    symbol: 'PF',
    name: 'Programming Fundamentals',
    theme: 'bg-cyan-500/15 border-cyan-500/35 text-cyan-400 group-hover:bg-cyan-500/25 group-hover:border-cyan-400 shadow-cyan-950/40',
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  },
};

const getSubjectMeta = (subject) => {
  if (!subject) {
    return {
      icon: Code2,
      symbol: 'CS',
      theme: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
      badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    };
  }

  const key = (subject.id || '').toLowerCase();
  if (SUBJECT_META[key]) return SUBJECT_META[key];

  const name = (subject.name || '').toLowerCase();
  if (name.includes('data structure') || name.includes('algorithm')) return SUBJECT_META.dsa;
  if (name.includes('object') || name.includes('oop')) return SUBJECT_META.oop;
  if (name.includes('database') || name.includes('dbms') || name.includes('sql')) return SUBJECT_META.db;
  if (name.includes('operating') || name.includes('kernel')) return SUBJECT_META.os;
  if (name.includes('network') || name.includes('telecom')) return SUBJECT_META.net;
  if (name.includes('artificial') || name.includes('intelligence') || name.includes('machine')) return SUBJECT_META.ai;
  if (name.includes('software')) return SUBJECT_META.se;
  if (name.includes('programming') || name.includes('fundamental')) return SUBJECT_META.pf;

  return {
    icon: Code2,
    symbol: subject.code || 'CS',
    theme: 'bg-blue-500/15 border-blue-500/30 text-blue-400 group-hover:bg-blue-500/25 group-hover:border-blue-400 shadow-blue-950/40',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  };
};

export default function Subjects({ subjects: propSubjects }) {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const subjectsList = propSubjects || COMPETITION_SUBJECTS;

  return (
    <section id="subjects" className="py-20 lg:py-24 relative bg-[#080d1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-heading font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curriculum & Domains</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-slate-900 dark:text-white mb-4">
            Seven Core <span className="text-[#3b82f6]">Competition Subjects</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            Every question across all four rounds is authoritatively drafted across these seven foundational computer science fields.
          </p>
        </div>

        {/* 7 Subject Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {subjectsList.map((subject, index) => {
            const meta = getSubjectMeta(subject);
            const IconComponent = meta.icon;
            const isLast = index === subjectsList.length - 1;

            return (
              <div
                key={subject.id}
                onClick={() => setSelectedSubject(subject)}
                className={`p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#0b1020]/90 border border-slate-200 dark:border-white/10 hover:border-blue-500/50 hover:-translate-y-1 transition-all duration-300 relative group cursor-pointer flex flex-col justify-between shadow-sm ${
                  isLast ? 'md:col-span-2 lg:col-span-1 lg:col-start-2' : ''
                }`}
              >
                <div>
                  {/* Subject Card Header with Domain Logo */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-13 h-13 rounded-2xl border flex items-center justify-center transition-all duration-300 shadow-md group-hover:scale-110 group-hover:shadow-lg ${meta.theme}`}>
                        <IconComponent className="w-6 h-6 shrink-0" />
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-[10px] font-mono font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border inline-block w-fit ${meta.badge}`}>
                          {meta.symbol}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Domain Logo
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-300 bg-slate-100 dark:bg-black/40 px-2 py-0.5 rounded border border-slate-200 dark:border-white/10">
                        {subject.code}
                      </span>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-heading font-bold uppercase mt-1">
                        {subject.difficulty}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                    {subject.name}
                  </h3>

                  <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mb-5">
                    {subject.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-white/10 mt-auto">
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(subject.topics || []).map((topic, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[11px] font-sans font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-black/40 px-2 py-0.5 rounded border border-slate-200 dark:border-white/5"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs font-heading font-bold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>View Syllabus Scope</span>
                    </span>
                    <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Syllabus Modal with Domain Logo Header */}
      {selectedSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0b1020] border border-white/15 p-6 sm:p-8 max-w-lg w-full rounded-2xl relative shadow-2xl">
            <button
              onClick={() => setSelectedSubject(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header with Domain Logo */}
            {(() => {
              const meta = getSubjectMeta(selectedSubject);
              const IconComponent = meta.icon;
              return (
                <div className="flex items-center gap-3.5 mb-4 pb-3 border-b border-white/10">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${meta.theme}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${meta.badge}`}>
                        {selectedSubject.code} • {meta.symbol}
                      </span>
                      <span className="text-xs text-blue-400 uppercase font-mono font-semibold">
                        {selectedSubject.difficulty}
                      </span>
                    </div>
                    <h3 className="text-xl font-heading font-bold text-white mt-1">
                      {selectedSubject.name}
                    </h3>
                  </div>
                </div>
              );
            })()}

            <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
              {selectedSubject.description}
            </p>

            <div className="mb-6">
              <h4 className="text-xs font-heading font-bold text-blue-400 uppercase tracking-wider mb-3">
                Key Examined Competencies:
              </h4>
              <div className="space-y-2">
                {selectedSubject.topics.map((t, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-200 bg-black/40 p-2.5 rounded-lg border border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedSubject(null)}
                className="px-5 py-2 rounded-xl bg-[#2563eb] text-white text-xs font-heading font-bold hover:bg-blue-600"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
