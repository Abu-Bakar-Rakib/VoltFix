import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ShieldCheck, Clock, Award, Phone } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80 pt-16 pb-12 text-slate-600 dark:text-slate-400 transition-colors">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        {/* Guarantees Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 mb-12 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-volt-500/10 border border-volt-500/20 flex items-center justify-center text-volt-500 dark:text-volt-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t('footerGuar1Title')}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('footerGuar1Desc')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-electric-500/10 border border-electric-500/20 flex items-center justify-center text-electric-500 dark:text-electric-400 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t('footerGuar2Title')}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('footerGuar2Desc')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t('footerGuar3Title')}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('footerGuar3Desc')}</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-volt-500 flex items-center justify-center text-slate-950 font-bold">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">VoltFix</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              {t('footerDesc')}
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-volt-600 dark:text-volt-400 mb-3">
              <Phone className="w-4 h-4" />
              <span>{t('emergencyHotline')}</span>
            </div>
            <div className="pt-2 flex items-center gap-2">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">{t('navCategories')}</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/search?categoryId=emergency-repairs" className="hover:text-slate-950 dark:hover:text-white transition-colors">Emergency Circuit Repair</Link></li>
              <li><Link to="/search?categoryId=residential-wiring" className="hover:text-slate-950 dark:hover:text-white transition-colors">Residential Home Rewiring</Link></li>
              <li><Link to="/search?categoryId=panel-breaker-upgrades" className="hover:text-slate-950 dark:hover:text-white transition-colors">Main Panel & RCBO Upgrades</Link></li>
              <li><Link to="/search?categoryId=ev-charger-installation" className="hover:text-slate-950 dark:hover:text-white transition-colors">Level 2 EV Charger Setup</Link></li>
              <li><Link to="/search?categoryId=solar-inverter-setup" className="hover:text-slate-950 dark:hover:text-white transition-colors">Hybrid Solar & IPS Inverters</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">{t('tagline')}</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/register?role=ELECTRICIAN" className="hover:text-slate-950 dark:hover:text-white transition-colors">{t('navJoinElectrician')}</Link></li>
              <li><Link to="/login" className="hover:text-slate-950 dark:hover:text-white transition-colors">{t('navLogin')}</Link></li>
              <li><Link to="/search" className="hover:text-slate-950 dark:hover:text-white transition-colors">{t('navFind')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">Platform & Options</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/api/docs" target="_blank" rel="noreferrer" className="hover:text-slate-950 dark:hover:text-white transition-colors">Swagger API Documentation</a></li>
              <li><span className="text-slate-500">Privacy Policy (Address Masking)</span></li>
              <li><span className="text-emerald-600 dark:text-emerald-400 font-semibold">🌐 English & বাংলা</span></li>
              <li><span className="text-volt-600 dark:text-volt-400 font-semibold">🌓 Dark & Light Themes</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>{t('footerCopy')}</p>
          <p className="mt-2 sm:mt-0 font-medium text-slate-700 dark:text-slate-300">
            {t('developedBy')}
          </p>
        </div>
      </div>
    </footer>
  );
};
