import React, { useState } from 'react';
import { TaskPriority, TaskCategory } from '../types';
import { Plus, ChevronDown, ChevronUp, Calendar, Tag, AlertCircle, Loader2 } from 'lucide-react';

interface TaskFormProps {
  onAddTask: (data: {
    title: string;
    description?: string;
    priority: TaskPriority;
    category?: TaskCategory;
    dueDate?: string;
  }) => Promise<void>;
  disabled?: boolean;
}

const CATEGORIES: { label: string; value: TaskCategory }[] = [
  { label: 'Work', value: 'work' },
  { label: 'Personal', value: 'personal' },
  { label: 'Shopping', value: 'shopping' },
  { label: 'Health', value: 'health' },
  { label: 'Learning', value: 'learning' },
  { label: 'Finance', value: 'finance' },
  { label: 'Other', value: 'other' },
];

const PRIORITIES: { label: string; value: TaskPriority; lightClass: string; darkClass: string }[] = [
  {
    label: 'Low',
    value: 'low',
    lightClass: 'border-slate-300 text-slate-700 hover:border-slate-400',
    darkClass: 'dark:border-slate-700 dark:hover:border-slate-500 dark:text-slate-300',
  },
  {
    label: 'Medium',
    value: 'medium',
    lightClass: 'border-sky-300 text-sky-700 hover:border-sky-400 bg-sky-50/50',
    darkClass: 'dark:border-sky-500/50 dark:hover:border-sky-400 dark:text-sky-400 dark:bg-transparent',
  },
  {
    label: 'High',
    value: 'high',
    lightClass: 'border-amber-300 text-amber-700 hover:border-amber-400 bg-amber-50/50',
    darkClass: 'dark:border-amber-500/50 dark:hover:border-amber-400 dark:text-amber-400 dark:bg-transparent',
  },
  {
    label: 'Urgent',
    value: 'urgent',
    lightClass: 'border-rose-300 text-rose-700 hover:border-rose-400 bg-rose-50/50',
    darkClass: 'dark:border-rose-500/50 dark:hover:border-rose-400 dark:text-rose-400 dark:bg-transparent',
  },
];

export const TaskForm: React.FC<TaskFormProps> = ({ onAddTask, disabled }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState<TaskCategory>('work');
  const [dueDate, setDueDate] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError('Task title is required.');
      return;
    }
    if (cleanTitle.length > 200) {
      setError('Task title must be 200 characters or fewer.');
      return;
    }
    if (description.trim().length > 1000) {
      setError('Description must be 1000 characters or fewer.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await onAddTask({
        title: cleanTitle,
        description: description.trim() || undefined,
        priority,
        category,
        dueDate: dueDate || undefined,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('work');
      setDueDate('');
      setIsExpanded(false);
    } catch (err: unknown) {
      console.error('Error creating task:', err);
      setError(err instanceof Error ? err.message : 'Failed to create task.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-6 shadow-sm dark:shadow-md transition-colors">
      <form onSubmit={handleSubmit}>
        {/* Main Title Bar */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Add a new task... (e.g., 'Review security audit checklist')"
            maxLength={200}
            disabled={disabled || submitting}
            className="flex-1 bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-1 focus:ring-indigo-500/40 transition"
          />

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-3 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-950/70 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition cursor-pointer"
            title={isExpanded ? 'Hide details' : 'Add details (notes, priority, due date)'}
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          <button
            type="submit"
            disabled={disabled || submitting || !title.trim()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-xs transition cursor-pointer shrink-0"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>

        {/* Validation Error Message */}
        {error && (
          <div className="flex items-center gap-2 text-xs text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-2.5 rounded-xl mt-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Expandable Details Drawer */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-4 animate-in fade-in duration-150">
            {/* Notes / Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Notes / Details (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add additional context, steps, or acceptance criteria..."
                rows={2}
                maxLength={1000}
                className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition resize-none"
              />
              <div className="text-[10px] text-right text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
                {description.length}/1000
              </div>
            </div>

            {/* Priority, Category, and Due Date grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Priority Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Priority
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriority(p.value)}
                      className={`text-[11px] font-medium py-1.5 px-1 rounded-lg border text-center transition cursor-pointer ${
                        priority === p.value
                          ? 'bg-indigo-600 text-white font-semibold border-indigo-600 shadow-xs ring-1 ring-indigo-400'
                          : `bg-slate-50 dark:bg-slate-950/40 ${p.lightClass} ${p.darkClass}`
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TaskCategory)}
                    className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs rounded-xl px-3 py-2 appearance-none focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Due Date Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Due Date (optional)
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  />
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
