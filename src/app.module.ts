import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { PomodoroSessionsModule } from './pomodoro-sessions/pomodoro-sessions.module';
import { PomodoroBreaksModule } from './pomodoro-breaks/pomodoro-breaks.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [TasksModule, PomodoroSessionsModule, PomodoroBreaksModule, AuthModule],
})
export class AppModule {}
