import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpCode,
  Query,
} from '@nestjs/common';
import { PomodoroSessionsService } from './pomodoro-sessions.service';
import { PomodoroSession } from './interfaces/pomodoro-session.interface';

@Controller('pomodoro-sessions')
export class PomodoroSessionsController {
  constructor(private readonly pomodoroSessionsService: PomodoroSessionsService) {}

  @Post()
  @HttpCode(201)
  create(@Body() body: Omit<PomodoroSession, 'id' | 'status'>) {
    return this.pomodoroSessionsService.create(body);
  }

  @Get()
  findAll(@Query('userId') userId: string) {
    if (userId) {
      return this.pomodoroSessionsService.findByUserId(userId);
    }
    return this.pomodoroSessionsService.findAll();
  }

  @Get('active')
  findActive(@Query('userId') userId: string) {
    if (!userId) {
      throw new Error('UserId é obrigatório');
    }
    return this.pomodoroSessionsService.findActiveSession(userId);
  }

  @Get('stats')
  getStats(@Query('userId') userId: string) {
    if (!userId) {
      throw new Error('UserId é obrigatório');
    }
    return this.pomodoroSessionsService.getSessionStats(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pomodoroSessionsService.findOne(id);
  }

  @Post(':id/complete')
  complete(@Param('id') id: string) {
    return this.pomodoroSessionsService.completeSession(id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.pomodoroSessionsService.cancelSession(id);
  }
}
