import React, { useState } from 'react';
import { Task, TaskPriority, TaskCategory } from '../types';
import confetti from 'canvas-confetti';
import {
  Check,
  Calendar,
  Trash2,
  Edit3,
  Save,
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (task: Task) => Promise<void>;
  onDelete: (task: Task) => void;
  onUpdate: (
    taskId: string,
    updates: {
      title: string;
      description?: string;
      priority: TaskPriority;
      category?: TaskCategory;
      dueDate?: string;
    }
  ) => Promise<void>;
}

const PRIORITY_BADGES: Record<
  TaskPriority,
  { label: string; badgeClass: string; dotClass: string }
> = {
  urgent: {
    label: 'Urgent',
    badgeClass: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/20',
    dotClass: 'bg-rose-500 animate-pulse',
  },
  high: {
    label: 'High',
    badgeClass: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/80 text-amber-700 dark:text-amber-300',
    dotClass: 'bg-amber-500',
  },
  medium: {
    label: 'Medium',
    badgeClass: 'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800/80 text-sky-700 dark:text-sky-300',
    dotClass: 'bg-sky-500',
  },
  low: {
    label: 'Low',
    badgeClass: 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300',
    dotClass: 'bg-slate-400',
  },
};

const CATEGORY_NAMES: Record<string, string> = {
  work: '💼 Work',
  personal: '👤 Personal',
  shopping: '🛒 Shopping',
  health: '🏃 Health',
  learning: '📚 Learning',
  finance: '💰 Finance',
  other: '✨ Other',
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onDelete,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description || '');
  const [editPriority, setEditPriority] = useState<TaskPriority>(task.priority);
  const [editCategory, setEditCategory] = useState<TaskCategory>(task.category || 'work');
  const [editDueDate, setEditDueDate] = useState(task.dueDate || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      if (!task.completed) {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#6366f1', '#10b981', '#38bdf8', '#fbbf24'],
        });
      }
      await onToggleComplete(task);
    } finally {
      setIsToggling(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;
    setIsSaving(true);
    try {
      await onUpdate(task.id, {
        title: editTitle.trim(),
        description: editDesc.trim() || undefined,
        priority: editPriority,
        category: editCategory,
        dueDate: editDueDate || undefined,
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditPriority(task.priority);
    setEditCategory(task.category || 'work');
    setEditDueDate(task.dueDate || '');
    setIsEditing(false);
  };

  const getDueDateLabel = (dueDateStr?: string) => {
    if (!dueDateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr + 'T00:00:00');
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `Overdue (${Math.abs(diffDays)}d)`, isOverdue: true };
    }
    if (diffDays === 0) {
      return { label: 'Due Today', isToday: true };
    }
    if (diffDays === 1) {
      return { label: 'Due Tomorrow', isSoon: true };
    }
    return { label: `Due in ${diffDays}d`, isFuture: true };
  };

  const dueDateInfo = getDueDateLabel(task.dueDate);
  const priorityConfig = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.medium;

  if (isEditing) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-indigo-400 dark:border-indigo-500/50 rounded-2xl p-4 shadow-md ring-1 ring-indigo-400/30 transition-all">
        <div className="space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            maxLength={200}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            placeholder="Task title..."
          />
          <textarea
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            maxLength={1000}
            rows={2}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
            placeholder="Add notes / details..."
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <select
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-slate-200"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent Priority</option>
            </select>

            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value as TaskCategory)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-slate-200"
            >
              {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
                <option key={key} value={key}>
                  {name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-slate-200"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={handleCancelEdit}
              className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={isSaving || !editTitle.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group relative bg-white dark:bg-slate-900/70 hover:bg-slate-50/80 dark:hover:bg-slate-900 border rounded-2xl p-4 transition-all duration-150 shadow-xs ${
        task.completed
          ? 'border-slate-200/70 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/40 opacity-75'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Checkbox Trigger */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={isToggling}
          className={`mt-0.5 shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
            task.completed
              ? 'bg-emerald-600 border-emerald-500 text-white shadow-xs'
              : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500 bg-white dark:bg-slate-950/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/20'
          }`}
          title={task.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Content Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h3
              className={`text-sm leading-snug break-words transition-all ${
                task.completed
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-900 dark:text-slate-100 font-semibold'
              }`}
            >
              {task.title}
            </h3>

            {/* Quick Actions */}
            <div className="flex items-center gap-1 shrink-0 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                title="Edit task"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(task)}
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                title="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Description if present */}
          {task.description && (
            <p
              className={`text-xs mt-1.5 line-clamp-2 leading-relaxed ${
                task.completed ? 'text-slate-400 dark:text-slate-600 line-through' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Metadata badges row */}
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 text-[11px]">
            {/* Priority Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border font-medium ${priorityConfig.badgeClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dotClass}`} />
              {priorityConfig.label}
            </span>

            {/* Category Badge */}
            {task.category && (
              <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-md">
                {CATEGORY_NAMES[task.category] || task.category}
              </span>
            )}

            {/* Due Date Indicator */}
            {dueDateInfo && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border font-mono tabular-nums ${
                  dueDateInfo.isOverdue
                    ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 font-semibold'
                    : dueDateInfo.isToday
                    ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/80 text-amber-700 dark:text-amber-300 font-medium'
                    : 'bg-slate-100 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Calendar className="w-3 h-3" />
                {dueDateInfo.label}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
