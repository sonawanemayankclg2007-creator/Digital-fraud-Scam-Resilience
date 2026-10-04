import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../services/api';

interface LoginProps {
  onLoginSuccess: (user: any, token: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.login({ email: email.trim(), password });
      const { access_token, user } = res.data;

      localStorage.setItem('arthraksha_token', access_token);
      localStorage.setItem('arthraksha_user', JSON.stringify(user));

      onLoginSuccess(user, access_token);

      // Automatic redirect strictly by role determined by backend
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'ANALYST') {
        navigate('/analyst');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (detail) {
        setError(detail);
      } else {
        setError('Invalid credentials or account issue. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAutofill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto my-8 space-y-6">
      {/* Brand & Tagline Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1.5px] mx-auto shadow-xl shadow-blue-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Shield className="w-7 h-7 text-blue-400" />
          </div>
        </div>
        <h1 className="text-2xl font-black tracking-wider text-white">ARTHRAKSHA</h1>
        <p className="text-xs font-semibold text-cyan-400 tracking-wide">
          "Detect. Explain. Warn. Protect."
        </p>
      </div>

      {/* Main Login Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 space-y-5 shadow-2xl backdrop-blur-sm">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white">Welcome Back</h2>
          <p className="text-xs text-slate-400">
            Sign in to continue protecting your financial safety.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Email
            </label>
            <div className="relative">
              <input
                id="login-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2.5 pl-3.5 pr-10 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                required
                autoComplete="email"
              />
              <Mail size={15} className="absolute right-3.5 top-3 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => alert('Password reset link sent to your registered email.')}
                className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2.5 pl-3.5 pr-10 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition-colors p-0.5"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Signing In...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-1 border-t border-slate-800/80">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 font-bold hover:underline">
            Create Account
          </Link>
        </div>
      </div>

      {/* Evaluator Quick Demo Fill (Does not select role, merely fills credentials to test single sign-in flow) */}
      <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-semibold flex items-center gap-1.5">
            <Sparkles size={12} className="text-cyan-400" />
            Quick Demo Credentials:
          </span>
          <span className="text-[10px] text-slate-500">Auto-routes to role dashboard</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleDemoAutofill('investor@arthraksha.in', 'User@123')}
            className="py-1.5 px-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition-all text-center"
          >
            User Demo
          </button>
          <button
            type="button"
            onClick={() => handleDemoAutofill('analyst@arthraksha.in', 'Analyst@123')}
            className="py-1.5 px-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-purple-300 text-xs font-medium transition-all text-center"
          >
            Analyst Demo
          </button>
          <button
            type="button"
            onClick={() => handleDemoAutofill('admin@arthraksha.in', 'Admin@123')}
            className="py-1.5 px-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-rose-300 text-xs font-medium transition-all text-center"
          >
            Admin Demo
          </button>
        </div>
      </div>
    </div>
  );
};
