export interface PomodoroSession {
  id: string;
  taskId: string;
  duration: number;
  durationMinutes?: number;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'cancelled';
  breakDuration?: number;
  breakType?: 'short' | 'long';
}