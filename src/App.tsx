import React, { useState, useEffect, useMemo } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { TaskStats } from './components/TaskStats';
import { TaskFilters } from './components/TaskFilters';
import { TaskForm } from './components/TaskForm';
import { TaskCard } from './components/TaskCard';
import { TeamPresence } from './components/TeamPresence';
import { DeleteModal } from './components/DeleteModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Task, TaskPriority, TaskCategory, FilterStatus, SortOption } from './types';
import {
  ShieldCheck,
  Lock,
  Sparkles,
  Users,
  ArrowRight,
  ListTodo,
} from 'lucide-react';

const PRIORITY_WEIGHTS: Record<TaskPriority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

function TodoApp() {
  const { user, loading: authLoading, signInWithGoogle, authError } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('createdAt_desc');

  // Modals & Panels
  const [isTeamOpen, setIsTeamOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 5);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Real-time listener for tasks strictly isolated by ownerId == user.uid
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setTasksLoading(false);
      return;
    }

    setTasksLoading(true);
    const path = 'tasks';
    const tasksQuery = query(collection(db, path), where('ownerId', '==', user.uid));

    const unsubscribe = onSnapshot(
      tasksQuery,
      (snapshot) => {
        const list: Task[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          list.push({
            id: docSnap.id,
            ownerId: d.ownerId,
            title: d.title,
            description: d.description,
            completed: Boolean(d.completed),
            priority: d.priority || 'medium',
            category: d.category,
            dueDate: d.dueDate,
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
          });
        });
        setTasks(list);
        setTasksLoading(false);
      },
      (error) => {
        setTasksLoading(false);
        addToast('error', 'Firestore Sync Error', error.message);
        handleFirestoreError(error, OperationType.GET, path);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Real-time listener for active team count in /users
  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        setOnlineCount(Math.max(1, snapshot.size));
      },
      (err) => {
        console.warn('Presence count sync:', err);
      }
    );
    return () => unsubscribe();
  }, [user]);

  // Task creation handler
  const handleAddTask = async (data: {
    title: string;
    description?: string;
    priority: TaskPriority;
    category?: TaskCategory;
    dueDate?: string;
  }) => {
    if (!user) return;

    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const docRef = doc(db, 'tasks', taskId);

    const payload = {
      ownerId: user.uid,
      title: data.title,
      ...(data.description ? { description: data.description } : {}),
      completed: false,
      priority: data.priority,
      ...(data.category ? { category: data.category } : {}),
      ...(data.dueDate ? { dueDate: data.dueDate } : {}),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(docRef, payload);
      addToast('success', 'Task Created', `"${data.title}" added to your list.`);
    } catch (error) {
      addToast('error', 'Failed to create task', error instanceof Error ? error.message : String(error));
      handleFirestoreError(error, OperationType.CREATE, `tasks/${taskId}`);
    }
  };

  // Toggle completion status
  const handleToggleComplete = async (task: Task) => {
    if (!user) return;
    const docRef = doc(db, 'tasks', task.id);
    const newStatus = !task.completed;

    try {
      await updateDoc(docRef, {
        completed: newStatus,
        updatedAt: serverTimestamp(),
      });
      if (newStatus) {
        addToast('success', 'Task Completed! 🎉', `"${task.title}" has been completed.`);
      }
    } catch (error) {
      addToast('error', 'Toggle Error', error instanceof Error ? error.message : String(error));
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${task.id}`);
    }
  };

  // Update task metadata
  const handleUpdateTask = async (
    taskId: string,
    updates: {
      title: string;
      description?: string;
      priority: TaskPriority;
      category?: TaskCategory;
      dueDate?: string;
    }
  ) => {
    if (!user) return;
    const docRef = doc(db, 'tasks', taskId);

    try {
      await updateDoc(docRef, {
        title: updates.title,
        ...(updates.description ? { description: updates.description } : { description: '' }),
        priority: updates.priority,
        ...(updates.category ? { category: updates.category } : { category: 'other' }),
        ...(updates.dueDate ? { dueDate: updates.dueDate } : { dueDate: '' }),
        updatedAt: serverTimestamp(),
      });
      addToast('success', 'Task Updated', 'Changes saved successfully.');
    } catch (error) {
      addToast('error', 'Update Error', error instanceof Error ? error.message : String(error));
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${taskId}`);
    }
  };

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (!deleteTarget || !user) return;
    setIsDeleting(true);
    const docRef = doc(db, 'tasks', deleteTarget.id);

    try {
      await deleteDoc(docRef);
      addToast('info', 'Task Deleted', `"${deleteTarget.title}" was removed.`);
      setDeleteTarget(null);
    } catch (error) {
      addToast('error', 'Delete Error', error instanceof Error ? error.message : String(error));
      handleFirestoreError(error, OperationType.DELETE, `tasks/${deleteTarget.id}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Clear completed batch handler
  const handleClearCompleted = async () => {
    const completedTasks = tasks.filter((t) => t.completed);
    if (completedTasks.length === 0) return;
    if (!window.confirm(`Clear all ${completedTasks.length} completed task(s)?`)) return;

    for (const t of completedTasks) {
      try {
        await deleteDoc(doc(db, 'tasks', t.id));
      } catch (err) {
        console.error('Batch clear failed on:', t.id, err);
      }
    }
    addToast('info', 'Completed Tasks Cleared', `${completedTasks.length} task(s) removed.`);
  };

  // Export tasks as Markdown
  const handleExportTasks = () => {
    if (tasks.length === 0) {
      addToast('info', 'No tasks to export', 'Create some tasks first.');
      return;
    }
    let md = `# SyncTasks Export - ${new Date().toLocaleDateString()}\n\n`;
    tasks.forEach((t) => {
      md += `- [${t.completed ? 'x' : ' '}] **${t.title}** (Priority: ${t.priority.toUpperCase()}${
        t.category ? `, Category: ${t.category}` : ''
      }${t.dueDate ? `, Due: ${t.dueDate}` : ''})\n`;
      if (t.description) {
        md += `  > ${t.description.replace(/\n/g, '\n  > ')}\n`;
      }
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `synctasks-export-${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Exported Successfully', 'Markdown file downloaded.');
  };

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter === 'active') {
      result = result.filter((t) => !t.completed);
    } else if (statusFilter === 'completed') {
      result = result.filter((t) => t.completed);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter((t) => t.category === categoryFilter);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'title_asc') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'priority_desc') {
        return PRIORITY_WEIGHTS[b.priority] - PRIORITY_WEIGHTS[a.priority];
      }
      if (sortBy === 'dueDate_asc') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (sortBy === 'createdAt_asc') {
        const timeA = typeof a.createdAt === 'object' && 'seconds' in a.createdAt ? a.createdAt.seconds : 0;
        const timeB = typeof b.createdAt === 'object' && 'seconds' in b.createdAt ? b.createdAt.seconds : 0;
        return timeA - timeB;
      }
      const timeA = typeof a.createdAt === 'object' && 'seconds' in a.createdAt ? a.createdAt.seconds : 0;
      const timeB = typeof b.createdAt === 'object' && 'seconds' in b.createdAt ? b.createdAt.seconds : 0;
      return timeB - timeA;
    });

    return result;
  }, [tasks, searchQuery, statusFilter, priorityFilter, categoryFilter, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 selection:bg-indigo-500/20 selection:text-indigo-900 dark:selection:bg-indigo-500/30 dark:selection:text-indigo-200">
      {/* App Header */}
      <Header onOpenTeam={() => setIsTeamOpen(true)} onlineCount={onlineCount} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {authLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-3 border-indigo-600 dark:border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">
              Connecting to secure Firebase session...
            </p>
          </div>
        ) : !user ? (
          /* Unauthenticated Landing State */
          <div className="max-w-3xl mx-auto py-12 px-4 text-center">
            {/* Hero Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-6 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Firebase ABAC Security • Isolated Cloud Records</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-5 leading-tight">
              Collaborative To-Do App with{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-sky-600 to-indigo-500 dark:from-indigo-400 dark:via-sky-300 dark:to-indigo-300 bg-clip-text text-transparent">
                Private Task Isolation
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
              Work together seamlessly with real-time sync across devices while your personal tasks remain
              mathematically isolated to your account.
            </p>

            {/* Sign in with Google Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
              <button
                onClick={signInWithGoogle}
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3.5 rounded-xl shadow-md shadow-indigo-600/20 transition-all transform hover:-translate-y-0.5 cursor-pointer text-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                <span>Continue with Google Sign-In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {authError && (
              <div className="max-w-md mx-auto mb-8 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                {authError}
              </div>
            )}

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left pt-6 border-t border-slate-200 dark:border-slate-800/80">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">Strict Isolation</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Every query is evaluated by Firestore security rules. Other users cannot read, list, or
                  modify your personal tasks.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">Real-Time Cloud Sync</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Sub-second updates powered by Firestore onSnapshot listeners. Changes sync instantly across
                  all your open tabs and devices.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">Team Presence Awareness</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  See which colleagues are currently online in the workspace while keeping individual task data
                  completely confidential.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard View */
          <div>
            {/* Metrics & Filter Shortcut Cards */}
            <TaskStats
              tasks={tasks}
              activeFilter={statusFilter}
              onFilterChange={setStatusFilter}
            />

            {/* New Task Creator Form */}
            <TaskForm onAddTask={handleAddTask} />

            {/* Search, Filter Tabs & Sort Controls */}
            <TaskFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              priorityFilter={priorityFilter}
              onPriorityChange={setPriorityFilter}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onExport={handleExportTasks}
              onClearCompleted={handleClearCompleted}
              hasCompletedTasks={tasks.some((t) => t.completed)}
            />

            {/* Task Cards List */}
            {tasksLoading ? (
              <div className="py-16 text-center">
                <div className="w-7 h-7 border-2 border-indigo-600 dark:border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-500 dark:text-slate-400">Loading your encrypted tasks from Firestore...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="py-16 px-4 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/20 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-3 border border-slate-200 dark:border-slate-800">
                  <ListTodo className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  {searchQuery || priorityFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all'
                    ? 'No matching tasks found'
                    : 'Your to-do list is empty'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-500 max-w-sm mx-auto mb-4">
                  {searchQuery || priorityFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your search terms or filter criteria above.'
                    : 'Add your first task above to get started with real-time cloud synchronization.'}
                </p>
                {(searchQuery || priorityFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setPriorityFilter('all');
                      setCategoryFilter('all');
                    }}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Reset all filters
                  </button>
                )}
              </div>
            ) : (
              <div>
                <div className="space-y-2.5">
                  {filteredTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleComplete={handleToggleComplete}
                      onDelete={(t) => setDeleteTarget(t)}
                      onUpdate={handleUpdateTask}
                    />
                  ))}
                </div>

                {/* Footer of the task list showing count of remaining incomplete tasks */}
                <div className="mt-4 pt-3.5 px-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 font-bold text-indigo-700 dark:text-indigo-300 font-mono tabular-nums text-xs">
                      {tasks.filter((t) => !t.completed).length}
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {tasks.filter((t) => !t.completed).length === 1 ? 'task remaining' : 'tasks remaining'}
                    </span>
                    {tasks.filter((t) => !t.completed).length === 0 && tasks.length > 0 && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        · All caught up! 🎉
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>
                      Total: <strong className="font-mono tabular-nums text-slate-700 dark:text-slate-300">{tasks.length}</strong>
                    </span>
                    {tasks.some((t) => t.completed) && (
                      <button
                        onClick={handleClearCompleted}
                        className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:underline cursor-pointer transition font-medium"
                      >
                        Clear completed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        task={deleteTarget}
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* Team Presence Modal */}
      <TeamPresence isOpen={isTeamOpen} onClose={() => setIsTeamOpen(false)} />

      {/* Notification Toast Stack */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TodoApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
