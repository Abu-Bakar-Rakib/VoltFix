import React from 'react';
import { Zap } from 'lucide-react';

interface LoadingSpinnerProps {
  label?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = 'Loading...',
  className = 'py-12',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-volt-500/20 border-t-volt-400 rounded-full animate-spin" />
        <Zap className="w-4 h-4 text-volt-400 absolute animate-pulse" />
      </div>
      {label && <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</p>}
    </div>
  );
};
