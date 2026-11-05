import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  HelpCircle, 
  Sparkles,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import { COMPETITION_DETAILS, FAQ_LIST } from '../data/competitionData';

export default function Contact() {
  const [inquiry, setInquiry] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inquiry.name || !inquiry.email || !inquiry.message) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setInquiry({ name: '', email: '', subject: '', message: '' });
    }, 4000);
  };

  return (
    <section id="contact" className="py-20 lg:py-24 relative overflow-hidden bg-[#060a14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-heading font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 mb-4">
            <Mail className="w-3.5 h-3.5" />
            <span>Connect & Support</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-white mb-4">
            University <span className="text-[#3b82f6]">Help Desk</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Have questions regarding round formats, eligibility, or venue access? Reach out to the organizing desk.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          
          {/* Left Column: Official Contact Placeholders */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0b1020]/90 border border-white/10 space-y-6 shadow-xl">
              <h3 className="text-xl font-heading font-bold text-white mb-1">
                Event Secretariat
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Managed directly by the {COMPETITION_DETAILS.organizer} at {COMPETITION_DETAILS.university}.
              </p>

              <div className="space-y-4 pt-1">
                
                {/* Email */}
                <div className="flex items-start gap-3.5 text-xs">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-heading font-semibold text-slate-400 uppercase tracking-wider block">
                      Email Inquiries
                    </span>
                    <span className="text-white font-mono text-sm">
                      quiz.secretariat@university.edu.pk
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Response within 24 working hours
                    </span>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3.5 text-xs">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-heading font-semibold text-slate-400 uppercase tracking-wider block">
                      Help Desk Helplines
                    </span>
                    <span className="text-white font-mono text-sm">
                      +92 (00) 123-4567 • Ext: 840
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Mon – Fri, 09:00 AM – 04:00 PM
                    </span>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3.5 text-xs">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-heading font-semibold text-slate-400 uppercase tracking-wider block">
                      Campus Venue Address
                    </span>
                    <span className="text-white text-sm">
                      Main University Auditorium & Academic Block B
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Faculty of Computing, University Road, COMSATS Campus
                    </span>
                  </div>
                </div>

              </div>

              {/* Social Placeholders */}
              <div className="pt-6 border-t border-white/10">
                <span className="text-[11px] font-heading font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                  Official Channels
                </span>
                <div className="flex items-center gap-2.5">
                  {[
                    { label: 'LinkedIn', icon: 'LI' },
                    { label: 'Twitter/X', icon: '𝕏' },
                    { label: 'Instagram', icon: 'IG' },
                    { label: 'YouTube', icon: 'YT' },
                    { label: 'Discord', icon: 'DC' },
                  ].map((s, idx) => (
                    <a
                      key={idx}
                      href="#contact"
                      title={s.label}
                      className="w-9 h-9 rounded-xl bg-black/40 border border-white/10 hover:border-blue-500 hover:text-blue-400 text-slate-300 flex items-center justify-center font-mono font-bold text-xs transition-all"
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Inquiry Message Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0b1020]/90 border border-white/10 shadow-xl">
              <h3 className="text-xl font-heading font-bold text-white mb-1">
                Send an Inquiry to Organizers
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Have questions regarding syllabus, timing, or rules? Send us a message.
              </p>

              {submitted ? (
                <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-center animate-fadeIn">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <h4 className="text-base font-heading font-bold text-white">Inquiry Dispatched Successfully!</h4>
                  <p className="text-xs text-emerald-200 mt-1">
                    Thank you. The student affairs coordinator will respond to your email promptly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-heading font-semibold text-slate-300 mb-1">
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Fatima Ali"
                        value={inquiry.name}
                        onChange={(e) => setInquiry({ ...inquiry, name: e.target.value })}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-heading font-semibold text-slate-300 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. fatima@student.uni.edu"
                        value={inquiry.email}
                        onChange={(e) => setInquiry({ ...inquiry, email: e.target.value })}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-heading font-semibold text-slate-300 mb-1">
                      Query Subject
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Clarification on Round 4 Buzzer rules or ID verification"
                      value={inquiry.subject}
                      onChange={(e) => setInquiry({ ...inquiry, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-heading font-semibold text-slate-300 mb-1">
                      Message / Question
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Write your question here..."
                      value={inquiry.message}
                      onChange={(e) => setInquiry({ ...inquiry, message: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs sm:text-sm focus:border-blue-500 focus:outline-none resize-none"
                    ></textarea>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#2563eb] text-white text-xs font-heading font-bold hover:bg-blue-600 inline-flex items-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Message</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* FAQs */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0b1020]/90 border border-white/10">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-heading font-bold text-white">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-3">
            {FAQ_LIST.map((faq, idx) => (
              <div 
                key={idx}
                className="rounded-xl bg-black/40 border border-white/10 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 font-heading font-semibold text-xs sm:text-sm text-white hover:text-blue-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-blue-400 shrink-0 transform transition-transform duration-200 ${
                    openFaq === idx ? 'rotate-180' : ''
                  }`} />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
