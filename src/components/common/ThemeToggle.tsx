import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'pill' | 'button';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  showLabel = false,
  size = 'md',
  variant = 'icon'
}) => {
  const { themeMode, toggleTheme } = useWorkspace();
  const isDark = themeMode === 'dark';

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-2.5 text-base'
  };

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const iconClass = iconSizes[size];

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
        aria-pressed={isDark}
        title={isDark ? 'Mode Gelap Aktif (Klik untuk Mode Terang)' : 'Mode Terang Aktif (Klik untuk Mode Gelap)'}
        className={`group inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 shadow-xs transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 ${className}`}
      >
        <span className="relative flex items-center justify-center">
          {isDark ? (
            <Sun className={`${iconClass} text-amber-400 transition-transform duration-300 rotate-0`} />
          ) : (
            <Moon className={`${iconClass} text-slate-600 transition-transform duration-300 rotate-0`} />
          )}
        </span>
        <span className="text-xs">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
      aria-pressed={isDark}
      title={isDark ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
      className={`relative inline-flex items-center justify-center rounded-xl text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 active:scale-90 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white ${sizeClasses[size]} ${className}`}
    >
      <span className="relative flex items-center justify-center overflow-hidden">
        {isDark ? (
          <Sun className={`${iconClass} text-amber-400 transition-all duration-300 transform rotate-0 hover:rotate-45`} />
        ) : (
          <Moon className={`${iconClass} text-slate-600 transition-all duration-300 transform rotate-0 hover:-rotate-12 dark:text-slate-300`} />
        )}
      </span>
      {showLabel && (
        <span className="ml-2 text-xs font-semibold">
          {isDark ? 'Terang' : 'Gelap'}
        </span>
      )}
    </button>
  );
};
