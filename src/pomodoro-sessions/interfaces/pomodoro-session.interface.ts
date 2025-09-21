export interface PomodoroSession {
  id: string;
  taskId: string;
  userId: string;
  duration: number;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'cancelled';
  breakDuration?: number;
  breakType?: 'short' | 'long';
}