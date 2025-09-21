import { Controller, Get, Post, Param, Body, HttpCode } from '@nestjs/common';
import { PomodoroSessionsService } from './pomodoro-sessions.service';
import { PomodoroSession } from './interfaces/pomodoro-session.interface';

@Controller('pomodoro-sessions')
export class PomodoroSessionsController {
  constructor(private readonly pomodoroSessionsService: PomodoroSessionsService) {}

  private formatSessionForResponse(session: any) {
    if (!session) return null;
    const start = session.startTime ? new Date(session.startTime) : null;
    const end = session.endTime ? new Date(session.endTime) : null;
    return {
      ...session,
      startTime: session.startTime,
      endTime: session.endTime,
      startTimePtBr: start
        ? start.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
        : null,
      endTimePtBr: end
        ? end.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
        : null,
    };
  }

  @Post()
  @HttpCode(201)
  create(@Body() body: Omit<PomodoroSession, 'id' | 'status'>) {
    const session = this.pomodoroSessionsService.create(body);
    return this.formatSessionForResponse(session);
  }

  @Get()
  findAll() {
    const sessions = this.pomodoroSessionsService.findAll();
    return sessions.map(s => this.formatSessionForResponse(s));
  }

  @Get('active')
  findActive() {
    const session = this.pomodoroSessionsService.findActiveSession();
    return this.formatSessionForResponse(session);
  }

  @Get('active/remaining')
  getActiveRemaining() {
    return this.pomodoroSessionsService.getRemainingTime();
  }

  @Get('stats')
  getStats() {
    return this.pomodoroSessionsService.getSessionStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const session = this.pomodoroSessionsService.findOne(id);
    return this.formatSessionForResponse(session);
  }

  @Get(':id/remaining')
  getRemaining(@Param('id') id: string) {
    return this.pomodoroSessionsService.getRemainingTime(id);
  }

  @Post(':id/complete')
  complete(@Param('id') id: string) {
    const session = this.pomodoroSessionsService.completeSession(id);
    return this.formatSessionForResponse(session);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    const session = this.pomodoroSessionsService.cancelSession(id);
    return this.formatSessionForResponse(session);
  }
}
