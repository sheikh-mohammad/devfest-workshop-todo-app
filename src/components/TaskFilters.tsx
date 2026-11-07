import React from 'react';
import { FilterStatus, TaskPriority, TaskCategory, SortOption } from '../types';
import { Search, Filter, ArrowUpDown, X, Download, CheckSquare } from 'lucide-react';

interface TaskFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: FilterStatus;
  onStatusChange: (status: FilterStatus) => void;
  priorityFilter: TaskPriority | 'all';
  onPriorityChange: (priority: TaskPriority | 'all') => void;
  categoryFilter: TaskCategory | 'all';
  onCategoryChange: (cat: TaskCategory | 'all') => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onExport: () => void;
  onClearCompleted?: () => void;
  hasCompletedTasks: boolean;
}

const CATEGORIES: { label: string; value: TaskCategory | 'all' }[] = [
  { label: 'All Categories', value: 'all' },
  { label: '💼 Work', value: 'work' },
  { label: '👤 Personal', value: 'personal' },
  { label: '🛒 Shopping', value: 'shopping' },
  { label: '🏃 Health', value: 'health' },
  { label: '📚 Learning', value: 'learning' },
  { label: '💰 Finance', value: 'finance' },
  { label: '✨ Other', value: 'other' },
];

const PRIORITIES: { label: string; value: TaskPriority | 'all'; color: string }[] = [
  { label: 'All', value: 'all', color: 'border-slate-700 text-slate-300' },
  { label: 'Urgent', value: 'urgent', color: 'border-rose-500/50 text-rose-400 bg-rose-950/30' },
  { label: 'High', value: 'high', color: 'border-amber-500/50 text-amber-400 bg-amber-950/30' },
  { label: 'Medium', value: 'medium', color: 'border-sky-500/50 text-sky-400 bg-sky-950/30' },
  { label: 'Low', value: 'low', color: 'border-slate-500/50 text-slate-400 bg-slate-900' },
];

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  categoryFilter,
  onCategoryChange,
  sortBy,
  onSortChange,
  onExport,
  onClearCompleted,
  hasCompletedTasks,
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-6 shadow-sm">
      {/* Top row: Search and primary controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks by title, note, or tag..."
            className="w-full pl-10 pr-9 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Pill Switcher */}
        <div className="inline-flex p-1 bg-slate-950/80 rounded-xl border border-slate-800 self-start md:self-auto">
          {(['all', 'active', 'completed'] as FilterStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => onStatusChange(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition cursor-pointer ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="appearance-none bg-slate-950/60 border border-slate-800 text-slate-200 text-xs font-medium pl-3 pr-8 py-2 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="createdAt_desc">Newest First</option>
              <option value="createdAt_asc">Oldest First</option>
              <option value="dueDate_asc">Due Date (Earliest)</option>
              <option value="priority_desc">Priority (Highest)</option>
              <option value="title_asc">Title (A-Z)</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Export Action */}
          <button
            onClick={onExport}
            className="p-2 text-slate-400 hover:text-slate-200 bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-xl transition cursor-pointer"
            title="Export tasks as Markdown"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom row: Category and Priority tags */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800/80">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onCategoryChange(cat.value)}
              className={`text-xs px-2.5 py-1 rounded-lg transition border cursor-pointer ${
                categoryFilter === cat.value
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-medium'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Priority Filter & Clear Completed */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 font-medium">Priority:</span>
          <div className="flex items-center gap-1">
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                onClick={() => onPriorityChange(p.value)}
                className={`text-[11px] px-2 py-0.5 rounded-md font-medium border transition cursor-pointer ${
                  priorityFilter === p.value
                    ? 'ring-1 ring-white/50 ' + p.color
                    : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-800/40'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {hasCompletedTasks && onClearCompleted && (
            <button
              onClick={onClearCompleted}
              className="text-xs text-rose-400 hover:text-rose-300 hover:underline ml-2 transition cursor-pointer"
            >
              Clear Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
