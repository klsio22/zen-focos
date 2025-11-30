import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { PomodoroSessionsService } from './pomodoro-sessions.service';
// pause/resume use no-body DTOs now (computed server-side)
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedUser {
  id: number;
  email: string;
  name?: string;
}

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

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
  @ApiResponse({
    status: 201,
    description: 'Pomodoro session started successfully',
  })
  async startSession(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.pomodoroService.startSession(taskId, req.user.id);
  }

  @Post('sessions/:sessionId/pause')
  @ApiOperation({ summary: 'Pause an active Pomodoro session' })
  @ApiParam({ name: 'sessionId', type: Number, description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Session paused successfully' })
  @ApiResponse({
    status: 400,
    description: 'Session is not active or already paused',
  })
  async pauseSession(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.pomodoroService.pauseSession(sessionId, req.user.id);
  }

  @Post('sessions/:sessionId/resume')
  @ApiOperation({ summary: 'Resume a paused Pomodoro session' })
  @ApiParam({ name: 'sessionId', type: Number, description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Session resumed successfully' })
  @ApiResponse({ status: 400, description: 'Session is not paused' })
  async resumeSession(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.pomodoroService.resumeSession(sessionId, req.user.id);
  }

  @Post('sessions/:sessionId/complete')
  @ApiOperation({ summary: 'Complete a Pomodoro session' })
  @ApiParam({ name: 'sessionId', type: Number, description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Session completed successfully' })
  async completeSession(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.pomodoroService.completeSession(sessionId, req.user.id);
  }

  @Post('sessions/:sessionId/cancel')
  @ApiOperation({ summary: 'Cancel a Pomodoro session' })
  @ApiParam({ name: 'sessionId', type: Number, description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Session cancelled successfully' })
  async cancelSession(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.pomodoroService.cancelSession(sessionId, req.user.id);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get all Pomodoro sessions for user' })
  @ApiResponse({
    status: 200,
    description: 'List of pomodoro sessions retrieved successfully',
  })
  async getSessions(@Request() req: AuthenticatedRequest) {
    return this.pomodoroService.getSessions(req.user.id);
  }
}
