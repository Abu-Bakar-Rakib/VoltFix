import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Zap, Wrench, User, AlertTriangle, ArrowRight, UserPlus, CheckCircle2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'ELECTRICIAN' ? 'ELECTRICIAN' : 'CUSTOMER';

  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<'CUSTOMER' | 'ELECTRICIAN'>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [experienceYears, setExperienceYears] = useState(3);
  const [city, setCity] = useState('Dhaka');
  const [hourlyRate, setHourlyRate] = useState(400);
  const [skills, setSkills] = useState('Emergency Repairs, Panel Upgrades, Wiring');

  const [loading, setLoading] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        name,
        email,
        password,
        phone,
        role,
      };

      if (role === 'ELECTRICIAN') {
        payload.experienceYears = Number(experienceYears);
        payload.city = city;
        payload.hourlyRate = Number(hourlyRate);
        payload.skills = skills.split(',').map((s) => s.trim()).filter(Boolean);
      }

      await registerUser(payload);
      setAccountCreated(true);
      setTimeout(() => {
        navigate(role === 'ELECTRICIAN' ? '/electrician/dashboard' : '/dashboard');
      }, 1200);
    } catch (err: any) {
      const errorData = err.response?.data?.error;
      const detailsMsg = errorData?.details?.map((d: any) => d.message).join('. ');
      setError(
        detailsMsg ||
          errorData?.message ||
          err.response?.data?.message ||
          err.message ||
          'Registration failed. Please check your inputs.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080C14] text-slate-900 dark:text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors bg-grid-pattern">
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
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Create your VoltFix account</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Join as a homeowner or verified service professional</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          {/* Segmented Auth Mode Switcher (Sign In vs Sign Up) */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <Link
              to="/login"
              className="py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>Sign In</span>
            </Link>
            <button
              type="button"
              className="py-2.5 rounded-xl text-xs font-extrabold bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/60 dark:border-white/10 flex items-center justify-center gap-1.5 cursor-default"
            >
              <UserPlus className="w-4 h-4 text-cyan-400" />
              <span>Sign Up</span>
            </button>
          </div>

          {accountCreated ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Account Created!</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5">
                  Welcome to VoltFix. Logging you in automatically...
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-volt-600 dark:text-cyan-400 pt-2">
                <div className="w-2 h-2 rounded-full bg-volt-500 animate-ping" />
                <span>Redirecting to your dashboard...</span>
              </div>
              <button
                type="button"
                onClick={() => navigate(role === 'ELECTRICIAN' ? '/electrician/dashboard' : '/dashboard')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-volt-600 hover:bg-volt-500 text-white text-xs font-bold transition-all shadow-glow-volt mt-2"
              >
                <span>Go to Dashboard Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
          {/* Role selector tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setRole('CUSTOMER')}
              className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                role === 'CUSTOMER'
                  ? 'bg-white dark:bg-slate-800 text-volt-600 dark:text-white shadow-sm border border-slate-200/60 dark:border-white/10'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              Customer
            </button>
            <button
              type="button"
              onClick={() => setRole('ELECTRICIAN')}
              className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                role === 'ELECTRICIAN'
                  ? 'bg-white dark:bg-slate-800 text-volt-600 dark:text-white shadow-sm border border-slate-200/60 dark:border-white/10'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Wrench className="w-4 h-4" />
              Electrician Pro
            </button>
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
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rahim Uddin"
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-volt-500"
              />
            </div>

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
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Password (min 6 characters)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-volt-500"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+8801700112233"
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-volt-500"
              />
            </div>

            {/* Additional Electrician Fields */}
            {role === 'ELECTRICIAN' && (
              <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(parseInt(e.target.value, 10))}
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-volt-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Hourly Rate (৳)
                    </label>
                    <input
                      type="number"
                      min="10"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(parseFloat(e.target.value))}
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-volt-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Primary City / Region
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-volt-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Key Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-volt-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-glow-volt transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Creating Account & Logging In...' : `Join as ${role === 'ELECTRICIAN' ? 'Pro Electrician' : 'Customer'}`}
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500">
              Sign in
            </Link>
          </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
