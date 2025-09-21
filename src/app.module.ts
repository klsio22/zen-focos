import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { PomodoroSessionsModule } from './pomodoro-sessions/pomodoro-sessions.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [TasksModule, PomodoroSessionsModule, AuthModule],
})
export class AppModule {}
