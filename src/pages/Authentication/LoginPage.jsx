import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    try {
      setSubmitting(true);
      const res = await login(email.trim(), password);
      if (res.success) {
        navigate(redirect, { replace: true });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
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
            Welcome Back, Foodie!
          </h2>
          <p className="text-xs sm:text-sm text-[#737B76]">
            Sign in to order fresh homemade meals & manage your subscriptions
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-[#737B76] absolute left-3.5 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E8ECE7] bg-[#F7F8F5] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-[#737B76] absolute left-3.5 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#E8ECE7] bg-[#F7F8F5] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] focus:bg-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3.5 text-[#737B76] hover:text-[#27352F]"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#14513F] text-white font-bold text-sm hover:bg-[#0E3B2E] transition-colors shadow-sm disabled:opacity-50"
          >
            <span>{submitting ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4 text-[#F6A23A]" />
          </button>
        </form>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-[#737B76] pt-1">
          <ShieldCheck className="w-4 h-4 text-[#14513F]" />
          <span>Stateless Secure JWT Authentication</span>
        </div>

        {/* Switch to Register */}
        <div className="text-center pt-2 border-t border-[#E8ECE7] text-xs text-[#737B76]">
          Don't have a GharKaSwad account?{' '}
          <Link
            to={`/register?redirect=${encodeURIComponent(redirect)}`}
            className="font-bold text-[#14513F] hover:underline"
          >
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
