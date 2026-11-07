import React from 'react';
import { Task, FilterStatus } from '../types';
import { CheckCircle2, Clock, AlertTriangle, Layers, Flame } from 'lucide-react';

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
        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
          activeFilter === 'all'
            ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-950/30 ring-1 ring-indigo-500/30'
            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400">Total Tasks</span>
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white tracking-tight">{total}</span>
          <span className="text-xs text-slate-400">items</span>
        </div>
      </button>

      {/* In Progress Card */}
      <button
        type="button"
        onClick={() => onFilterChange('active')}
        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
          activeFilter === 'active'
            ? 'bg-amber-950/40 border-amber-500/50 shadow-md shadow-amber-950/30 ring-1 ring-amber-500/30'
            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400">Pending Actions</span>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-400 tracking-tight">{active}</span>
          <span className="text-xs text-slate-400">left</span>
        </div>
      </button>

      {/* Completed Card */}
      <button
        type="button"
        onClick={() => onFilterChange('completed')}
        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
          activeFilter === 'completed'
            ? 'bg-emerald-950/40 border-emerald-500/50 shadow-md shadow-emerald-950/30 ring-1 ring-emerald-500/30'
            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400">Completed</span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-400 tracking-tight">{completed}</span>
          <span className="text-xs text-emerald-500/90 font-medium">({completionRate}%)</span>
        </div>
        {/* Progress Mini Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </button>

      {/* Urgent Attention Card */}
      <div className="p-4 rounded-xl border bg-slate-900/60 border-slate-800 text-left">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400">High / Urgent</span>
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
            <Flame className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold tracking-tight ${urgentOrHigh > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
            {urgentOrHigh}
          </span>
          <span className="text-xs text-slate-400">critical</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-2 truncate">
          {urgentOrHigh > 0 ? 'Needs priority attention' : 'All clear on urgent tasks'}
        </div>
      </div>
    </div>
  );
};
