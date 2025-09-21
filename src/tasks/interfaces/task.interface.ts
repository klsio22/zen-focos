export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  estimatedPomodoros: number;
  completedPomodoros: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}