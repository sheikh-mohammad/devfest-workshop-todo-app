import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { CheckCircle2, Users, LogOut, Lock, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  onOpenTeam: () => void;
  onlineCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onOpenTeam, onlineCount }) => {
  const { user, signInWithGoogle, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Connection Status */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-0.5 shadow-md shadow-indigo-500/20 flex items-center justify-center shrink-0">
            <div className="h-full w-full bg-white dark:bg-slate-950 rounded-[10px] flex items-center justify-center transition-colors">
              <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                SyncTasks
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                Live Sync
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Active Collaborators Trigger */}
          {user && (
            <button
              onClick={onOpenTeam}
              className="group flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 px-2.5 sm:px-3 py-1.5 rounded-xl transition shadow-xs cursor-pointer"
              title="View active team members"
            >
              <div className="relative">
                <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              </div>
              <span className="hidden sm:inline">Active Collaborators</span>
              <span className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] px-1.5 py-0.2 rounded-md font-semibold font-mono tabular-nums">
                {onlineCount}
              </span>
            </button>
          )}

          {/* Security badge (visible on larger screens) */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 px-2.5 py-1.5 rounded-xl">
            <Lock className="w-3.5 h-3.5 text-indigo-500 dark:text-sky-400" />
            <span className="text-[11px] font-medium">Isolated User Records</span>
          </div>

          {/* Dark / Light Mode Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition cursor-pointer shadow-xs"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600 transition-transform hover:-rotate-12" />
            )}
          </button>

          {/* Auth Section */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-indigo-500/40 object-cover ring-2 ring-indigo-500/20"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-600/30 border border-indigo-300 dark:border-indigo-500 flex items-center justify-center text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                    {user.email ? user.email.slice(0, 2).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[120px] truncate leading-tight">
                    {user.displayName || user.email?.split('@')[0]}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 max-w-[120px] truncate font-mono">
                    {user.email}
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold px-3.5 sm:px-4 py-2 rounded-xl shadow-sm shadow-indigo-600/20 transition cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
