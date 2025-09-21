export interface PomodoroBreak {
  id: string;
  sessionId: string;
  duration: number; // minutes
  startTime: Date;
  endTime?: Date;
  type: 'short' | 'long';
  status: 'scheduled' | 'running' | 'completed' | 'cancelled';
}
