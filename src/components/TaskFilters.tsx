import React from 'react';
import { FilterStatus, TaskPriority, TaskCategory, SortOption } from '../types';
import { Search, ArrowUpDown, X, Download } from 'lucide-react';

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

const PRIORITIES: { label: string; value: TaskPriority | 'all'; lightClass: string; darkClass: string }[] = [
  { label: 'All', value: 'all', lightClass: 'border-slate-300 text-slate-700', darkClass: 'dark:border-slate-700 dark:text-slate-300' },
  { label: 'Urgent', value: 'urgent', lightClass: 'border-rose-300 text-rose-700 bg-rose-50', darkClass: 'dark:border-rose-500/50 dark:text-rose-400 dark:bg-rose-950/30' },
  { label: 'High', value: 'high', lightClass: 'border-amber-300 text-amber-700 bg-amber-50', darkClass: 'dark:border-amber-500/50 dark:text-amber-400 dark:bg-amber-950/30' },
  { label: 'Medium', value: 'medium', lightClass: 'border-sky-300 text-sky-700 bg-sky-50', darkClass: 'dark:border-sky-500/50 dark:text-sky-400 dark:bg-sky-950/30' },
  { label: 'Low', value: 'low', lightClass: 'border-slate-300 text-slate-600 bg-slate-50', darkClass: 'dark:border-slate-500/50 dark:text-slate-400 dark:bg-slate-900' },
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
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-6 shadow-sm transition-colors">
      {/* Top row: Search, Status switcher, Sort, and Export */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks by title, note, or tag..."
            className="w-full pl-10 pr-9 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-1 focus:ring-indigo-500/50 transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Pill Switcher */}
        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 self-start md:self-auto">
          {(['all', 'active', 'completed'] as FilterStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => onStatusChange(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Sort Select & Export */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="appearance-none bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium pl-3 pr-8 py-2 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="createdAt_desc" className="bg-white dark:bg-slate-900">Newest First</option>
              <option value="createdAt_asc" className="bg-white dark:bg-slate-900">Oldest First</option>
              <option value="dueDate_asc" className="bg-white dark:bg-slate-900">Due Date (Earliest)</option>
              <option value="priority_desc" className="bg-white dark:bg-slate-900">Priority (Highest)</option>
              <option value="title_asc" className="bg-white dark:bg-slate-900">Title (A-Z)</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={onExport}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 rounded-xl transition cursor-pointer shadow-xs"
            title="Export tasks as Markdown"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom row: Category and Priority tags */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onCategoryChange(cat.value)}
              className={`text-xs px-2.5 py-1 rounded-lg transition border cursor-pointer ${
                categoryFilter === cat.value
                  ? 'bg-indigo-50 dark:bg-indigo-600/20 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-semibold'
                  : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-300'
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
                    ? `ring-1 ring-indigo-500 font-semibold ${p.lightClass} ${p.darkClass}`
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {hasCompletedTasks && onClearCompleted && (
            <button
              onClick={onClearCompleted}
              className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:underline ml-2 transition cursor-pointer font-medium"
            >
              Clear Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
