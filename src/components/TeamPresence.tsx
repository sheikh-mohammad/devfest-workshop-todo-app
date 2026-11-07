import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile } from '../types';
import { Users, ShieldCheck, X, Circle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TeamPresenceProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeamPresence: React.FC<TeamPresenceProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !user) return;

    const path = 'users';
    setLoading(true);

    const unsubscribe = onSnapshot(
      collection(db, path),
      (snapshot) => {
        const list: UserProfile[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          list.push({
            uid: doc.id,
            displayName: data.displayName || 'Collaborator',
            email: data.email || '',
            photoURL: data.photoURL,
            updatedAt: data.updatedAt,
          });
        });
        setMembers(list);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );

    return () => unsubscribe();
  }, [isOpen, user]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-colors">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Active Team Members</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Real-time workspace presence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Isolation Notice */}
        <div className="px-5 py-3.5 bg-indigo-50/70 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/30 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
            <strong className="font-semibold text-indigo-900 dark:text-white">Strict Data Isolation Enforced:</strong> Each team member's tasks are mathematically locked to their own Google UID via Firestore security rules. No one else can read or modify your personal tasks.
          </div>
        </div>

        {/* Member List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 flex-1">
          {loading ? (
            <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">Loading active teammates...</div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">No other active users detected.</div>
          ) : (
            members.map((member) => {
              const isCurrentUser = member.uid === user?.uid;
              return (
                <div
                  key={member.uid}
                  className={`flex items-center justify-between p-3 rounded-xl border transition ${
                    isCurrentUser
                      ? 'bg-indigo-50/70 dark:bg-slate-800/60 border-indigo-200 dark:border-indigo-500/40'
                      : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      {member.photoURL ? (
                        <img
                          src={member.photoURL}
                          alt={member.displayName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-300 dark:border-slate-700"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-600/30 border border-indigo-300 dark:border-indigo-500/50 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300">
                          {member.displayName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {member.displayName}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[10px] bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.2 rounded font-semibold">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate font-mono">{member.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 shrink-0 font-medium bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 px-2 py-0.8 rounded-lg">
                    <Circle className="w-1.5 h-1.5 fill-emerald-500" />
                    <span>Online</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
