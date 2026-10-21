import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Zap, ShieldCheck, Wrench, User, AlertTriangle, ArrowRight, UserPlus } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login({ email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    setError(null);
    try {
      await login({ email: demoEmail, password: demoPass });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080C14] text-slate-900 dark:text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors bg-grid-pattern">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 border border-amber-500/40 flex items-center justify-center shadow-glow-volt group-hover:border-amber-400 group-hover:scale-105 transition-all">
            <Zap className="w-6 h-6 text-amber-400 fill-amber-400 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
          </div>
          <span className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white">
            Volt<span className="text-amber-500 dark:text-amber-400">Fix</span>
          </span>
        </Link>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Sign in to your account</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select a role or enter your credentials below</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          {/* Segmented Auth Mode Switcher (Sign In vs Sign Up) */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              className="py-2.5 rounded-xl text-xs font-extrabold bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/60 dark:border-white/10 flex items-center justify-center gap-1.5 cursor-default"
            >
              <User className="w-4 h-4 text-volt-500" />
              <span>Sign In</span>
            </button>
            <Link
              to="/register"
              className="py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <UserPlus className="w-4 h-4 text-cyan-400" />
              <span>Sign Up</span>
            </Link>
          </div>
          {/* Quick 1-Click Role Login Bar */}
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2.5 text-center">
              1-Click Demo Logins
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('arif.chowdhury@gmail.com', 'Customer@123')}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-left transition-all group"
              >
                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1" />
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Customer</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">Arif C.</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('tariqul.electric@gmail.com', 'Electrician@123')}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-left transition-all group"
              >
                <Wrench className="w-4 h-4 text-volt-600 dark:text-volt-400 mb-1" />
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Electrician</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">Tariqul I.</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@voltfix.com', 'Admin@12345')}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-left transition-all group"
              >
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 mb-1" />
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Admin</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">Abu Bakar Rakib</span>
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
            <span className="flex-shrink mx-3 text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Or with email</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-volt-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-volt-600 dark:text-volt-400 hover:text-volt-500"
                >
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-glow-volt transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
