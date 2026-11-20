import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const RegisterPage = () => {
  const { registerSendOtp, registerVerifyOtp, resendOtp } = useAuth();
  const { error: showError } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  // Step: 1 = Form Details, 2 = Verify OTP
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  // OTP State
  const [otp, setOtp] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown countdown
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();

    // Client-side validations
    if (formData.name.trim().length < 2) {
      showError('Name must be at least 2 characters.');
      return;
    }
    if (!/^(?:\+?91)?[6-9]\d{9}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      showError('Please provide a valid 10-digit Indian phone number.');
      return;
    }
    if (formData.password.length < 8) {
      showError('Password must be at least 8 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      showError('Password and Confirm Password do not match.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await registerSendOtp(formData);
      if (res.success) {
        setRegisteredEmail(res.email || formData.email.trim().toLowerCase());
        setStep(2);
        setResendCooldown(60);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      showError('Please enter the 6-digit numeric verification code.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await registerVerifyOtp({
        email: registeredEmail,
        otp: otp.trim(),
      });
      if (res.success) {
        navigate(redirect, { replace: true });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    const res = await resendOtp(registeredEmail);
    if (res.success) {
      setResendCooldown(60);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-[#E8ECE7] shadow-lg space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#14513F] flex items-center justify-center text-white font-bold text-lg shadow-sm">
              <span className="text-[#F6A23A]">G</span>K
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-[#14513F]">
              GharKa<span className="text-[#F6A23A]">Swad</span>
            </span>
          </Link>
          <h2 className="text-xl sm:text-2xl font-black text-[#27352F]">
            {step === 1 ? 'Join GharKaSwad' : 'Verify Your Email'}
          </h2>
          <p className="text-xs sm:text-sm text-[#737B76]">
            {step === 1
              ? 'Taste genuine homemade food cooked with love'
              : `Enter the 6-digit verification code sent to ${registeredEmail}`}
          </p>
        </div>

        {/* STEP 1: Registration Form */}
        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-[#737B76] absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Aditi Sharma"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E8ECE7] bg-[#F7F8F5] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-[#737B76] absolute left-3.5 pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E8ECE7] bg-[#F7F8F5] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1">
                Mobile Number
              </label>
              <div className="relative flex items-center">
                <Phone className="w-4 h-4 text-[#737B76] absolute left-3.5 pointer-events-none" />
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E8ECE7] bg-[#F7F8F5] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-[#737B76] absolute left-3.5 pointer-events-none" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 8 characters with Upper, Lower & Number"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E8ECE7] bg-[#F7F8F5] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-[#737B76] absolute left-3.5 pointer-events-none" />
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E8ECE7] bg-[#F7F8F5] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-3 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#14513F] text-white font-bold text-sm hover:bg-[#0E3B2E] transition-colors shadow-sm disabled:opacity-50"
            >
              <span>{submitting ? 'Sending Verification Code...' : 'Send Verification OTP'}</span>
              <ArrowRight className="w-4 h-4 text-[#F6A23A]" />
            </button>
          </form>
        ) : (
          /* STEP 2: Verify OTP */
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#F6A23A]/30 text-center space-y-1">
              <KeyRound className="w-6 h-6 text-[#F6A23A] mx-auto" />
              <p className="text-xs font-bold text-[#14513F]">Check Your Inbox</p>
              <p className="text-xs text-[#737B76]">
                We sent a 6-digit code to <strong>{registeredEmail}</strong>. Valid for 5 minutes.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1.5 text-center">
                Enter 6-Digit OTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                required
                autoFocus
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full tracking-[0.5em] text-center font-mono font-extrabold text-2xl py-3 rounded-xl border border-[#E8ECE7] bg-[#F7F8F5] text-[#14513F] focus:outline-none focus:border-[#14513F] focus:bg-white transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || otp.length !== 6}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#14513F] text-white font-bold text-sm hover:bg-[#0E3B2E] transition-colors shadow-sm disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-[#F6A23A]" />
              <span>{submitting ? 'Verifying Account...' : 'Verify & Complete Account'}</span>
            </button>

            {/* Resend Cooldown */}
            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[#737B76] hover:text-[#27352F]"
              >
                ← Edit details
              </button>

              {resendCooldown > 0 ? (
                <span className="text-[#737B76] font-medium">
                  Resend code in {resendCooldown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="font-bold text-[#14513F] hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Resend OTP</span>
                </button>
              )}
            </div>
          </form>
        )}

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-[#737B76] pt-1">
          <ShieldCheck className="w-4 h-4 text-[#14513F]" />
          <span>Hygienic Home Food Network</span>
        </div>

        {/* Switch to Login */}
        <div className="text-center pt-2 border-t border-[#E8ECE7] text-xs text-[#737B76]">
          Already have an account?{' '}
          <Link
            to={`/login?redirect=${encodeURIComponent(redirect)}`}
            className="font-bold text-[#14513F] hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
