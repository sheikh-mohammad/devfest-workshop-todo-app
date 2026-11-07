import { Timestamp } from 'firebase/firestore';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskCategory =
  | 'work'
  | 'personal'
  | 'shopping'
  | 'health'
  | 'learning'
  | 'finance'
  | 'other';

export interface Task {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: TaskPriority;
  category?: TaskCategory;
  dueDate?: string; // ISO string e.g. YYYY-MM-DD
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  updatedAt?: Timestamp;
  isOnline?: boolean;
}

export type FilterStatus = 'all' | 'active' | 'completed';
export type SortOption = 'createdAt_desc' | 'createdAt_asc' | 'dueDate_asc' | 'priority_desc' | 'title_asc';
