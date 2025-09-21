import { Module } from '@nestjs/common';
import { PomodoroBreaksController } from './pomodoro-breaks.controller';
import { PomodoroBreaksService } from './pomodoro-breaks.service';

@Module({
  controllers: [PomodoroBreaksController],
  providers: [PomodoroBreaksService],
  exports: [PomodoroBreaksService],
})
export class PomodoroBreaksModule {}
