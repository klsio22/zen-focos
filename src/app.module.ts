import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { PomodoroSessionsModule } from './pomodoro-sessions/pomodoro-sessions.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [TasksModule, PomodoroSessionsModule, AuthModule, UsersModule],
})
export class AppModule {}
