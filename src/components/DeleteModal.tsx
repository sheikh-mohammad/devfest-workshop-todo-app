import React from 'react';
import { Task } from '../types';
import { Trash2, X } from 'lucide-react';

interface DeleteModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  task,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl transition-colors">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <Trash2 className="w-5 h-5" />
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Delete this task?</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
          Are you sure you want to permanently delete{' '}
          <strong className="text-slate-900 dark:text-slate-200">"{task.title}"</strong>? This action is permanent.
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {isDeleting ? 'Deleting...' : 'Delete Task'}
          </button>
        </div>
      </div>
    </div>
  );
};
