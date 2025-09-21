import { Module } from '@nestjs/common';
import { PomodoroSessionsController } from './pomodoro-sessions.controller';
import { PomodoroSessionsService } from './pomodoro-sessions.service';

@Module({
  controllers: [PomodoroSessionsController],
  providers: [PomodoroSessionsService],
  exports: [PomodoroSessionsService],
})
export class PomodoroSessionsModule {}
