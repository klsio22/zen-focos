import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TasksService } from '../tasks/tasks.service';
import { PauseSessionDto } from './dto/pause-session.dto';
import { ResumeSessionDto } from './dto/resume-session.dto';

@Injectable()
export class PomodoroSessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tasksService: TasksService,
  ) {}

  async startSession(taskId: number, userId: number) {
    // Verify task exists and user owns it
    await this.tasksService.findOne(taskId, userId);

    // Cancel any existing active session for this user
    await this.cancelActiveSessions(userId);

    // Create new session
    return this.prisma.pomodoroSession.create({
      data: {
        userId,
        taskId,
        duration: 25, // Fixed 25 minutes
        startTime: new Date(),
        status: 'ACTIVE',
        isPaused: false,
        remainingSeconds: null,
      },
      include: {
        task: true,
      },
    });
  }

  async pauseSession(
    sessionId: number,
    pauseDto: PauseSessionDto,
    userId: number,
  ) {
    const session = await this.findSession(sessionId, userId);

    if (session.status !== 'ACTIVE') {
      throw new BadRequestException('Session is not active');
    }

    if (session.isPaused) {
      throw new BadRequestException('Session is already paused');
    }

    return this.prisma.pomodoroSession.update({
      where: { id: sessionId },
      data: {
        isPaused: true,
        remainingSeconds: pauseDto.remainingSeconds,
      },
      include: {
        task: true,
      },
    });
  }

  async resumeSession(
    sessionId: number,
    resumeDto: ResumeSessionDto,
    userId: number,
  ) {
    const session = await this.findSession(sessionId, userId);

    if (!session.isPaused) {
      throw new BadRequestException('Session is not paused');
    }

    return this.prisma.pomodoroSession.update({
      where: { id: sessionId },
      data: {
        isPaused: false,
        status: 'ACTIVE',
        startTime: new Date(),
        remainingSeconds: resumeDto.remainingSeconds,
      },
      include: {
        task: true,
      },
    });
  }

  async completeSession(sessionId: number, userId: number) {
    const session = await this.findSession(sessionId, userId);

    const updatedSession = await this.prisma.pomodoroSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        endTime: new Date(),
        isPaused: false,
        remainingSeconds: null,
      },
    });

    // Increment task's completed pomodoros
    const task = await this.tasksService.incrementCompletedPomodoros(
      session.taskId,
      userId,
    );

    return {
      session: updatedSession,
      completedPomodoros: task.completedPomodoros,
    };
  }

  async cancelSession(sessionId: number, userId: number) {
    await this.findSession(sessionId, userId);

    return this.prisma.pomodoroSession.update({
      where: { id: sessionId },
      data: {
        status: 'CANCELLED',
        endTime: new Date(),
        isPaused: false,
        remainingSeconds: null,
      },
      include: {
        task: true,
      },
    });
  }

  async getActiveSession(userId: number) {
    const sessions = await this.prisma.pomodoroSession.findMany({
      where: {
        userId,
        status: 'ACTIVE',
      },
      include: {
        task: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const active = sessions.find((session) => this.isActive(session)) || null;
    const paused = sessions.filter((session) => session.isPaused);

    return { active, paused };
  }

  private async findSession(sessionId: number, userId: number) {
    const session = await this.prisma.pomodoroSession.findFirst({
      where: { id: sessionId, userId },
      include: { task: true },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  private isActive(session: any): boolean {
    return session.status === 'ACTIVE' && !session.isPaused;
  }

  private async cancelActiveSessions(userId: number) {
    await this.prisma.pomodoroSession.updateMany({
      where: {
        userId,
        status: 'ACTIVE',
      },
      data: {
        status: 'CANCELLED',
        endTime: new Date(),
        isPaused: false,
        remainingSeconds: null,
      },
    });
  }
}
