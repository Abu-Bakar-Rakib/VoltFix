import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Home, Search, PhoneCall, User, ShieldCheck } from 'lucide-react';

export const MobileBottomBar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'ELECTRICIAN') return '/electrician/dashboard';
    return '/dashboard';
  };

  const isActive = (path: string, exact: boolean = true) => {
    if (exact) return location.pathname === path && !location.search.includes('emergencyOnly=true');
    return location.pathname.startsWith(path);
  };

  const isEmergencyActive = location.search.includes('emergencyOnly=true');

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-white/10 shadow-[0_-4px_25px_-5px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_30px_-5px_rgba(0,0,0,0.5)] transition-colors pb-[max(env(safe-area-inset-bottom),0.35rem)] pt-1.5 px-3"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* 1. Home */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
            isActive('/')
              ? 'text-volt-600 dark:text-cyan-400 font-extrabold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Home className={`w-5 h-5 transition-transform ${isActive('/') ? 'scale-110' : ''}`} />
          <span className="text-[10px] mt-1 tracking-tight">
            {language === 'bn' ? 'হোম' : 'Home'}
          </span>
        </Link>

        {/* 2. Search / Map */}
        <Link
          to="/search"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
            isActive('/search') && !isEmergencyActive
              ? 'text-volt-600 dark:text-cyan-400 font-extrabold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Search className={`w-5 h-5 transition-transform ${isActive('/search') && !isEmergencyActive ? 'scale-110' : ''}`} />
          <span className="text-[10px] mt-1 tracking-tight">
            {language === 'bn' ? 'ম্যাপে খুঁজুন' : 'Find Map'}
          </span>
        </Link>

        {/* 3. Emergency 24/7 (Prominent floating action style) */}
        <Link
          to="/search?emergencyOnly=true"
          className={`flex flex-col items-center justify-center -mt-4 py-1 px-3.5 rounded-full transition-all duration-200 ${
            isEmergencyActive
              ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-lg ring-4 ring-rose-500/30 scale-105'
              : 'bg-rose-500 text-white shadow-md hover:bg-rose-600 hover:scale-105'
          }`}
        >
          <div className="relative">
            <PhoneCall className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-300 animate-ping" />
          </div>
          <span className="text-[9px] font-black tracking-tight mt-0.5">
            {language === 'bn' ? 'জরুরি ২৪/৭' : '24/7 Urgent'}
          </span>
        </Link>

        {/* 4. Dashboard / Account */}
        <Link
          to={getDashboardPath()}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
            isActive('/dashboard', false) || isActive('/admin', false) || isActive('/electrician/dashboard', false) || isActive('/login')
              ? 'text-volt-600 dark:text-cyan-400 font-extrabold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {user ? (
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          ) : (
            <User className="w-5 h-5" />
          )}
          <span className="text-[10px] mt-1 tracking-tight">
            {user ? (language === 'bn' ? 'ড্যাশবোর্ড' : 'Account') : (language === 'bn' ? 'লগইন' : 'Login')}
          </span>
        </Link>
      </div>
    </nav>
  );
};
