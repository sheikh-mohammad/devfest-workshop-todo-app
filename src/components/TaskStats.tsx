import React from 'react';
import { Task, FilterStatus } from '../types';
import { CheckCircle2, Clock, Layers, Flame } from 'lucide-react';

interface TaskStatsProps {
  tasks: Task[];
  activeFilter: FilterStatus;
  onFilterChange: (status: FilterStatus) => void;
}

export const TaskStats: React.FC<TaskStatsProps> = ({ tasks, activeFilter, onFilterChange }) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const active = total - completed;
  const urgentOrHigh = tasks.filter((t) => !t.completed && (t.priority === 'urgent' || t.priority === 'high')).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* Total Tasks Card */}
      <button
        type="button"
        onClick={() => onFilterChange('all')}
        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-xs ${
          activeFilter === 'all'
            ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-500/50 ring-1 ring-indigo-400 dark:ring-indigo-500/30'
            : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/80 dark:hover:bg-slate-900'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Tasks</span>
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight tabular-nums font-mono">
            {total}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">records</span>
        </div>
      </button>

      {/* Pending Actions Card */}
      <button
        type="button"
        onClick={() => onFilterChange('active')}
        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-xs ${
          activeFilter === 'active'
            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-500/50 ring-1 ring-amber-400 dark:ring-amber-500/30'
            : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/80 dark:hover:bg-slate-900'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">In Progress</span>
          <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 tracking-tight tabular-nums font-mono">
            {active}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">pending</span>
        </div>
      </button>

      {/* Completed Card */}
      <button
        type="button"
        onClick={() => onFilterChange('completed')}
        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-xs ${
          activeFilter === 'completed'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/50 ring-1 ring-emerald-400 dark:ring-emerald-500/30'
            : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/80 dark:hover:bg-slate-900'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Completed</span>
          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight tabular-nums font-mono">
            {completed}
          </span>
          <span className="text-xs text-emerald-700 dark:text-emerald-400/90 font-medium font-mono tabular-nums">
            ({completionRate}%)
          </span>
        </div>
        {/* Progress Mini Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </button>

      {/* Urgent Attention Card */}
      <div className="p-4 rounded-2xl border bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-left shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">High / Urgent</span>
          <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <Flame className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold tracking-tight tabular-nums font-mono ${urgentOrHigh > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
            {urgentOrHigh}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">urgent</span>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 truncate">
          {urgentOrHigh > 0 ? 'Needs high priority attention' : 'No urgent bottlenecks'}
        </div>
      </div>
    </div>
  );
};
