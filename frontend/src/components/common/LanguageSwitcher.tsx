import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  className?: string;
  compact?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '', compact = false }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`inline-flex items-center bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-xl p-0.5 shadow-sm ${className}`}
      title={language === 'en' ? 'Switch to বাংলা' : 'Switch to English'}
    >
      <div className="flex items-center pl-1.5 pr-1 text-slate-400">
        <Globe className="w-3.5 h-3.5 text-volt-500 dark:text-cyan-400" />
      </div>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
          language === 'en'
            ? 'bg-white dark:bg-slate-700 text-volt-600 dark:text-white shadow-sm border border-slate-200/60 dark:border-white/10'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        }`}
      >
        EN
      </button>

      <button
        type="button"
        onClick={() => setLanguage('bn')}
        className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
          language === 'bn'
            ? 'bg-white dark:bg-slate-700 text-volt-600 dark:text-white shadow-sm border border-slate-200/60 dark:border-white/10'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        }`}
      >
        বাং
      </button>
    </div>
  );
};
