import { Module } from '@nestjs/common';
import { PomodoroSessionsController } from './pomodoro-sessions.controller';
import { PomodoroSessionsService } from './pomodoro-sessions.service';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [TasksModule],
  controllers: [PomodoroSessionsController],
  providers: [PomodoroSessionsService],
  exports: [PomodoroSessionsService],
})
export class PomodoroSessionsModule {}
