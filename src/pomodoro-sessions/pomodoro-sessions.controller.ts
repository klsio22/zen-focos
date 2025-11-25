import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UseGuards, 
  ParseIntPipe,
  Request 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam 
} from '@nestjs/swagger';
import { PomodoroSessionsService } from './pomodoro-sessions.service';
import { PauseSessionDto } from './dto/pause-session.dto';
import { ResumeSessionDto } from './dto/resume-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('pomodoro')
@ApiBearerAuth()
@Controller({
  path: 'pomodoro',
  version: '1',
})
@UseGuards(JwtAuthGuard)
export class PomodoroSessionsController {
  constructor(private readonly pomodoroService: PomodoroSessionsService) {}

  @Post('tasks/:taskId/start-session')
  @ApiOperation({ summary: 'Start a new Pomodoro session for a task' })
  @ApiParam({ name: 'taskId', type: Number, description: 'Task ID' })
  @ApiResponse({ status: 201, description: 'Pomodoro session started successfully' })
  async startSession(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Request() req,
  ) {
    return this.pomodoroService.startSession(taskId, req.user.id);
  }

  @Post('sessions/:sessionId/pause')
  @ApiOperation({ summary: 'Pause an active Pomodoro session' })
  @ApiParam({ name: 'sessionId', type: Number, description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Session paused successfully' })
  @ApiResponse({ status: 400, description: 'Session is not active or already paused' })
  async pauseSession(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Body() pauseDto: PauseSessionDto,
    @Request() req,
  ) {
    return this.pomodoroService.pauseSession(sessionId, pauseDto, req.user.id);
  }

  @Post('sessions/:sessionId/resume')
  @ApiOperation({ summary: 'Resume a paused Pomodoro session' })
  @ApiParam({ name: 'sessionId', type: Number, description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Session resumed successfully' })
  @ApiResponse({ status: 400, description: 'Session is not paused' })
  async resumeSession(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Body() resumeDto: ResumeSessionDto,
    @Request() req,
  ) {
    return this.pomodoroService.resumeSession(sessionId, resumeDto, req.user.id);
  }

  @Post('sessions/:sessionId/complete')
  @ApiOperation({ summary: 'Complete a Pomodoro session' })
  @ApiParam({ name: 'sessionId', type: Number, description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Session completed successfully' })
  async completeSession(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Request() req,
  ) {
    return this.pomodoroService.completeSession(sessionId, req.user.id);
  }

  @Post('sessions/:sessionId/cancel')
  @ApiOperation({ summary: 'Cancel a Pomodoro session' })
  @ApiParam({ name: 'sessionId', type: Number, description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Session cancelled successfully' })
  async cancelSession(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Request() req,
  ) {
    return this.pomodoroService.cancelSession(sessionId, req.user.id);
  }

  @Get('active-session')
  @ApiOperation({ summary: 'Get active Pomodoro session for user' })
  @ApiResponse({ status: 200, description: 'Active session retrieved successfully' })
  async getActiveSession(@Request() req) {
    return this.pomodoroService.getActiveSession(req.user.id);
  }
}


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

  @Post(':id/advance')
  advance(@Param('id') id: string) {
    const result = this.pomodoroSessionsService.advanceToBreak(id);
    return {
      session: this.formatSessionForResponse(result.session),
      break: result.break
    };
  }
}
