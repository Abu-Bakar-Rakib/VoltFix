import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 text-center transition-colors">
      <div className="w-16 h-16 rounded-3xl bg-volt-500/10 border border-volt-500/20 text-volt-500 dark:text-volt-400 flex items-center justify-center mb-6 shadow-glow-volt">
        <Zap className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">404 - Page Not Found</h1>
      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mb-6">
        The circuit you're looking for seems to be broken or disconnected. Let's get you back on grid.
      </p>
      <Link
        to="/"
        className="px-6 py-2.5 rounded-xl bg-volt-500 text-slate-950 font-bold text-xs hover:bg-volt-400 transition-colors flex items-center gap-2 shadow-glow-volt"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Home
      </Link>
    </div>
  );
};
