import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-4 rounded-xl border shadow-lg flex items-start gap-3 transition-all animate-in slide-in-from-bottom-3 duration-200 ${
            toast.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/90 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
              : toast.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          ) : toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
          )}

          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold">{toast.title}</div>
            {toast.message && (
              <div className="text-[11px] opacity-90 mt-0.5 leading-relaxed break-words">
                {toast.message}
              </div>
            )}
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="p-1 opacity-60 hover:opacity-100 transition rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
