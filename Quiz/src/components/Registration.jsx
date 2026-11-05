import React, { useState } from 'react';
import { 
  User, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  IdCard, 
  Mail, 
  Phone, 
  Building2, 
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { saveParticipant, setLoggedInStudent } from '../utils/storage';
import { apiStudentRegister, setStudentAuthToken } from '../utils/api';

export default function Registration({ onParticipantRegistered, onOpenStudentPortal }) {
  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    universityName: 'COMSATS University Islamabad',
    campus: 'Islamabad Campus',
    region: 'Federal Capital',
    email: '',
    phone: '',
    degreeProgram: 'BS Computer Science',
    semester: '4th Semester',
    password: '',
    confirmPassword: '',
    rulesAccepted: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successParticipant, setSuccessParticipant] = useState(null);

  const campuses = [
    'Islamabad Campus',
    'Lahore Campus',
    'Wah Campus',
    'Abbottabad Campus',
    'Attock Campus',
    'Sahiwal Campus',
    'Vehari Campus',
    'Other University / External',
  ];

  const regions = [
    'Federal Capital',
    'Punjab',
    'KPK',
    'Sindh',
    'Balochistan',
    'Azad Jammu & Kashmir',
    'Gilgit-Baltistan',
  ];

  const degreePrograms = [
    'BS Computer Science',
    'BS Software Engineering',
    'BS Artificial Intelligence',
    'BS Cyber Security',
    'BS Data Science',
    'BS Information Technology',
    'MS Computer Science',
    'Other Computing Program',
  ];

  const semesters = [
    '1st Semester',
    '2nd Semester',
    '3rd Semester',
    '4th Semester',
    '5th Semester',
    '6th Semester',
    '7th Semester',
    '8th Semester',
  ];

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full student name is required';
    if (!formData.studentId.trim()) newErrors.studentId = 'Student Registration ID is required (e.g. FA21-BCS-042)';
    if (!formData.universityName.trim()) newErrors.universityName = 'University name is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'University email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email format';
    }

    // Phone validation
    const phoneClean = formData.phone.replace(/[\s\-\+\(\)]/g, '');
    if (!formData.phone.trim()) {
      newErrors.phone = 'Contact number is required';
    } else if (phoneClean.length < 10) {
      newErrors.phone = 'Please provide a valid phone number (min 10 digits)';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required (min 6 characters)';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Rules & Consent
    if (!formData.rulesAccepted) {
      newErrors.rulesAccepted = 'You must accept the individual competition rules & anti-cheating policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) {
      const el = document.getElementById('register');
      if (el) window.scrollTo({ top: el.offsetTop - 50, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        studentId: formData.studentId.trim().toUpperCase(),
        universityName: formData.universityName.trim(),
        campus: formData.campus,
        region: formData.region,
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        degreeProgram: formData.degreeProgram,
        semester: formData.semester,
        password: formData.password,
        rulesAccepted: formData.rulesAccepted,
      };

      const res = await apiStudentRegister(payload);

      if (!res.success) {
        setServerError(res.error || 'Registration failed. Please check inputs.');
        setIsSubmitting(false);
        return;
      }

      const participant = res.participant;
      setSuccessParticipant(participant);
      saveParticipant(participant);
      setLoggedInStudent(participant);
      if (res.token) setStudentAuthToken(res.token);

      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#2563EB', '#60A5FA', '#FACC15', '#FFFFFF'],
        });
      } catch {}

      onParticipantRegistered && onParticipantRegistered(participant);

      // Reset form
      setFormData({
        fullName: '',
        studentId: '',
        universityName: 'COMSATS University Islamabad',
        campus: 'Islamabad Campus',
        region: 'Federal Capital',
        email: '',
        phone: '',
        degreeProgram: 'BS Computer Science',
        semester: '4th Semester',
        password: '',
        confirmPassword: '',
        rulesAccepted: false,
      });
      setErrors({});
    } catch (err) {
      setServerError(err.message || 'Server connection error during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="register" className="py-20 lg:py-24 relative bg-[#060a14] overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-heading font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 mb-4">
            <User className="w-3.5 h-3.5" />
            <span>Official Student Registration</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-white mb-3">
            Register to <span className="text-[#3b82f6]">Compete Individually</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Every student competes solo. Enter your verified academic credentials below to secure your authorized examination pass for Battle of Brains 2026.
          </p>
        </div>

        {/* Form Card */}
        <div className="p-6 sm:p-10 rounded-2xl bg-[#0b1020]/95 border border-white/10 shadow-2xl relative">
          
          {serverError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            
            {/* Full Name & Student ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-heading font-bold text-slate-200 mb-1.5">
                  Student Full Name <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hamza Tariq"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl bg-black/50 border text-white text-sm font-medium focus:outline-none transition-all placeholder:text-slate-500 ${
                    errors.fullName ? 'border-rose-500' : 'border-white/15 focus:border-blue-500'
                  }`}
                />
                {errors.fullName && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.fullName}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-heading font-bold text-slate-200 mb-1.5">
                  Student Registration ID <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. FA21-BCS-042"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl bg-black/50 border text-white text-sm font-mono font-medium focus:outline-none transition-all placeholder:text-slate-500 ${
                    errors.studentId ? 'border-rose-500' : 'border-white/15 focus:border-blue-500'
                  }`}
                />
                {errors.studentId && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.studentId}</span>
                  </p>
                )}
              </div>
            </div>

            {/* University & Campus */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-heading font-bold text-slate-200 mb-1.5">
                  University / Institution Name <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. COMSATS University Islamabad"
                  value={formData.universityName}
                  onChange={(e) => setFormData({ ...formData, universityName: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl bg-black/50 border text-white text-sm font-medium focus:outline-none transition-all placeholder:text-slate-500 ${
                    errors.universityName ? 'border-rose-500' : 'border-white/15 focus:border-blue-500'
                  }`}
                />
                {errors.universityName && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.universityName}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-heading font-bold text-slate-200 mb-1.5">
                  Campus <span className="text-rose-500 font-bold">*</span>
                </label>
                <select
                  value={formData.campus}
                  onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-white text-sm font-medium focus:border-blue-500 focus:outline-none"
                >
                  {campuses.map((c) => (
                    <option key={c} value={c} className="bg-[#0b1020] text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Region & University Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-heading font-bold text-slate-200 mb-1.5">
                  Region / Province <span className="text-rose-500 font-bold">*</span>
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-white text-sm font-medium focus:border-blue-500 focus:outline-none"
                >
                  {regions.map((r) => (
                    <option key={r} value={r} className="bg-[#0b1020] text-white">
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-heading font-bold text-slate-200 mb-1.5">
                  University / Official Email <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. student@student.comsats.edu.pk"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl bg-black/50 border text-white text-sm font-medium focus:outline-none transition-all placeholder:text-slate-500 ${
                    errors.email ? 'border-rose-500' : 'border-white/15 focus:border-blue-500'
                  }`}
                />
                {errors.email && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Contact Phone & Degree Program */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-heading font-bold text-slate-200 mb-1.5">
                  Contact Phone / WhatsApp <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +92 300 1234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl bg-black/50 border text-white text-sm font-mono font-medium focus:outline-none transition-all placeholder:text-slate-500 ${
                    errors.phone ? 'border-rose-500' : 'border-white/15 focus:border-blue-500'
                  }`}
                />
                {errors.phone && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-heading font-bold text-slate-200 mb-1.5">
                  Degree Program <span className="text-rose-500 font-bold">*</span>
                </label>
                <select
                  value={formData.degreeProgram}
                  onChange={(e) => setFormData({ ...formData, degreeProgram: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-white text-sm font-medium focus:border-blue-500 focus:outline-none"
                >
                  {degreePrograms.map((dp) => (
                    <option key={dp} value={dp} className="bg-[#0b1020] text-white">
                      {dp}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Semester & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-heading font-bold text-slate-200 mb-1.5">
                  Current Semester <span className="text-rose-500 font-bold">*</span>
                </label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-white text-sm font-medium focus:border-blue-500 focus:outline-none"
                >
                  {semesters.map((s) => (
                    <option key={s} value={s} className="bg-[#0b1020] text-white">
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-heading font-bold text-slate-200 mb-1.5">
                  Create Password <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl bg-black/50 border text-white text-sm font-medium focus:outline-none transition-all placeholder:text-slate-500 pr-10 ${
                      errors.password ? 'border-rose-500' : 'border-white/15 focus:border-blue-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-heading font-bold text-slate-200 mb-1.5">
                  Confirm Password <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl bg-black/50 border text-white text-sm font-medium focus:outline-none transition-all placeholder:text-slate-500 pr-10 ${
                      errors.confirmPassword ? 'border-rose-500' : 'border-white/15 focus:border-blue-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.confirmPassword}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Rules & Regulations Consent */}
            <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/30">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.rulesAccepted}
                  onChange={(e) => setFormData({ ...formData, rulesAccepted: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded border-white/20 bg-black/50 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs text-slate-300 leading-relaxed">
                  I certify that I am registering as an <strong className="text-white">individual solo competitor</strong>. I have read and agree to the tournament regulations, anti-cheating buzzer policies, mandatory physical student ID verification, and irrevocable finality of organizer decisions.
                </span>
              </label>
              {errors.rulesAccepted && (
                <p className="text-[11px] text-rose-400 mt-2 flex items-center gap-1 font-semibold">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.rulesAccepted}</span>
                </p>
              )}
            </div>

            {/* Submit Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                <span>Records stored authoritatively in central championship database</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-9 py-3.5 rounded-xl bg-[#2563eb] hover:bg-blue-600 active:bg-blue-700 text-white font-heading font-bold text-sm shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Enrolling Student...</span>
                ) : (
                  <>
                    <span>Submit Official Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>

        </div>

      </div>

      {/* SUCCESS CONFIRMATION MODAL */}
      {successParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0b1020] border border-blue-500/50 p-6 sm:p-8 max-w-lg w-full rounded-2xl shadow-2xl relative">
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto mb-3 shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3.5 py-1 rounded-full border border-blue-500/20">
                Individual Pass Generated
              </span>
              <h3 className="text-2xl font-heading font-bold text-white mt-3">
                Registration Confirmed!
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                You are officially enrolled for Battle of Brains 2026.
              </p>
            </div>

            {/* Official Registration Pass Card */}
            <div className="bg-black/60 border border-white/10 rounded-xl p-5 mb-6 text-xs space-y-2.5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-slate-400 font-mono">Tournament Pass Reference</span>
                <span className="font-mono font-bold text-base text-blue-400">{successParticipant.id}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div><span className="text-slate-400">Student Name:</span> <strong className="text-white block">{successParticipant.fullName}</strong></div>
                <div><span className="text-slate-400">Registration ID:</span> <strong className="text-white block font-mono">{successParticipant.studentId}</strong></div>
                <div><span className="text-slate-400">University:</span> <span className="text-slate-200 block truncate">{successParticipant.universityName}</span></div>
                <div><span className="text-slate-400">Campus:</span> <span className="text-slate-200 block">{successParticipant.campus}</span></div>
                <div><span className="text-slate-400">Program:</span> <span className="text-slate-200 block">{successParticipant.degreeProgram}</span></div>
                <div><span className="text-slate-400">Status:</span> <span className="text-emerald-400 font-bold block">{successParticipant.registrationStatus || 'Approved'}</span></div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                onClick={() => setSuccessParticipant(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 text-slate-300 text-xs font-heading font-semibold hover:bg-white/20 transition-colors cursor-pointer"
              >
                Close Window
              </button>
              {onOpenStudentPortal && (
                <button
                  onClick={() => {
                    setSuccessParticipant(null);
                    onOpenStudentPortal();
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#2563eb] text-white text-xs font-heading font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Launch Student Portal</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
