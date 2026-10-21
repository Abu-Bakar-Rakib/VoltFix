import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import {
  Zap,
  Search,
  Bell,
  Shield,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  PhoneCall,
  CheckCircle2,
  UserPlus,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isCustomer, isElectrician, isAdmin } = useAuth();
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useSocket();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (isAdmin) return '/admin';
    if (isElectrician) return '/electrician/dashboard';
    return '/dashboard';
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 dark:from-slate-900 dark:via-slate-850 dark:to-slate-800 border border-amber-500/30 flex items-center justify-center shadow-glow-volt group-hover:border-amber-400 group-hover:scale-105 transition-all">
              <Zap className="w-5 h-5 text-amber-400 fill-amber-400 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold font-heading tracking-tight text-slate-900 dark:text-white flex items-center">
                Volt<span className="text-amber-500 dark:text-amber-400">Fix</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400 -mt-1">
                {t('tagline')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/search"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Search className="w-4 h-4 text-volt-500 dark:text-volt-400" />
              {t('navFind')}
            </Link>

            <Link
              to="/search?emergencyOnly=true"
              className="text-sm font-semibold text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 flex items-center gap-1.5 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
              {t('navEmergency')}
            </Link>
          </nav>

          {/* Right Action Icons, Theme, Language & Auth */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Theme Switcher (Dark / Light) */}
            <ThemeToggle />

            {/* Language Switcher (EN | বাং) */}
            <LanguageSwitcher />

            {user ? (
              <>
                {/* Real-time Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotifDropdownOpen(!notifDropdownOpen);
                      setProfileDropdownOpen(false);
                    }}
                    className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-volt-600 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl p-4 border border-slate-200 dark:border-slate-700/60 z-50 animate-in fade-in zoom-in-95">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t('notifications')}</h4>
                          {unreadCount > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-volt-500/20 text-volt-700 dark:text-volt-300 font-semibold">
                              {unreadCount} {t('newBadge')}
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllNotificationsRead}
                            className="text-xs text-slate-500 dark:text-slate-400 hover:text-volt-600 dark:hover:text-volt-400 transition-colors"
                          >
                            {t('markAllRead')}
                          </button>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 mt-2">
                        {notifications.length === 0 ? (
                          <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">{t('noNotifications')}</p>
                        ) : (
                          notifications.slice(0, 8).map((n) => (
                            <div
                              key={n.id}
                              onClick={() => markNotificationRead(n.id)}
                              className={`py-2.5 px-2 rounded-lg cursor-pointer transition-colors ${
                                n.isRead ? 'hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-500 dark:text-slate-400' : 'bg-slate-100/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-semibold text-slate-900 dark:text-white">{n.title}</p>
                                {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-volt-500 dark:bg-volt-400 mt-1" />}
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                              <span className="text-[10px] text-slate-400 dark:text-slate-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(!profileDropdownOpen);
                      setNotifDropdownOpen(false);
                    }}
                    className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <img
                      src={
                        user.avatarUrl && !user.avatarUrl.includes('unsplash')
                          ? user.avatarUrl
                          : user.role === 'ADMIN'
                          ? '/avatar-rakib.png'
                          : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`
                      }
                      alt={user.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          user.role === 'ADMIN'
                            ? '/avatar-rakib.png'
                            : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`;
                      }}
                      className="w-8 h-8 rounded-full object-cover border border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800"
                    />
                    <div className="text-left hidden lg:block">
                      <p className="text-xs font-semibold text-slate-800 dark:text-white truncate max-w-[120px]">{user.name}</p>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-volt-600 dark:text-volt-400">
                        {user.role}
                      </span>
                    </div>
                  </button>

                  {/* Profile Menu Dropdown */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl p-2 border border-slate-200 dark:border-slate-700/60 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          to={getDashboardLink()}
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Shield className="w-4 h-4 text-volt-500 dark:text-volt-400" />
                          {t('navDashboard')}
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          {t('navLogout')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t('navLogin')}
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-black px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 shadow-sm hover:shadow-glow-volt transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5 text-slate-950" />
                  <span>{t('navSignup')}</span>
                </Link>
                <Link
                  to="/register?role=ELECTRICIAN"
                  className="hidden xl:flex text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white items-center gap-1 transition-colors ml-1"
                >
                  <Zap className="w-3 h-3 text-volt-500" />
                  <span>{t('navJoinElectrician')}</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button + Language & Theme Switcher */}
          <div className="flex md:hidden items-center gap-1.5">
            <ThemeToggle />
            <LanguageSwitcher compact />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200 py-2"
          >
            <Search className="w-4 h-4 text-volt-500 dark:text-volt-400" />
            {t('navFind')}
          </Link>
          <Link
            to="/search?emergencyOnly=true"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-sm font-medium text-rose-500 dark:text-rose-400 py-2"
          >
            <PhoneCall className="w-4 h-4" />
            {t('navEmergency')}
          </Link>

          {user ? (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <Link
                to={getDashboardLink()}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-sm font-semibold text-volt-600 dark:text-volt-400 py-2"
              >
                <span>{t('navDashboard')} ({user.role})</span>
                <Shield className="w-4 h-4" />
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-medium text-rose-500 dark:text-rose-400 py-2 w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                {t('navLogout')}
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-sm font-bold py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  {t('navLogin')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-sm font-black py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 shadow-sm flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4 text-slate-950" />
                  <span>{t('navSignup')}</span>
                </Link>
              </div>
              <Link
                to="/register?role=ELECTRICIAN"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-xs font-bold py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-volt-500" />
                <span>{t('navJoinElectrician')}</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
