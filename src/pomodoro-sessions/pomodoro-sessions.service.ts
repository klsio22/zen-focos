import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TasksService } from '../tasks/tasks.service';
import { PauseSessionDto } from './dto/pause-session.dto';
import { ResumeSessionDto } from './dto/resume-session.dto';

@Injectable()
export class PomodoroSessionsService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tasksService: TasksService,
  ) {}

  private _processorInterval: NodeJS.Timeout | null = null;

  async startSession(taskId: number, userId: number) {
    await this.tasksService.findOne(taskId, userId);

    const existing = await this.prisma.pomodoroSession.findFirst({
      where: { userId, taskId, status: 'ACTIVE', isPaused: false },
    });
    if (existing) {
      throw new BadRequestException(
        'There is already an active Pomodoro session for this task.',
      );
    }

    const startTime = new Date();
    const durationMinutes = 25;
    const remainingSeconds = durationMinutes * 60;
    const endTime = new Date(startTime.getTime() + remainingSeconds * 1000);

    return this.prisma.pomodoroSession.create({
      data: {
        userId,
        taskId,
        duration: durationMinutes,
        startTime,
        endTime,
        status: 'ACTIVE',
        isPaused: false,
        remainingSeconds,
      },
      include: {
        task: true,
      },
    });
  }

  // Periodic processor: check for expired active sessions and roll them over
  async handleExpiredSessions() {
    const now = new Date();

    const expired = await this.prisma.pomodoroSession.findMany({
      where: {
        status: 'ACTIVE',
        isPaused: false,
        endTime: { lte: now },
      },
      include: { task: true },
    });

    if (!expired || expired.length === 0) return;

    for (const session of expired) {
      try {
        // mark session as completed
        await this.prisma.pomodoroSession.update({
          where: { id: session.id },
          data: {
            status: 'COMPLETED',
            endTime: session.endTime || now,
            isPaused: false,
            remainingSeconds: null,
          },
        });

        // increment task's completed pomodoros and get updated task
        const task = await this.tasksService.incrementCompletedPomodoros(
          session.taskId,
          session.userId,
        );

        // If task still has remaining pomodoros, start next session
        if (task.completedPomodoros < task.estimatedPomodoros) {
          // ensure no active session exists for this task + user
          const existing = await this.prisma.pomodoroSession.findFirst({
            where: {
              userId: session.userId,
              taskId: session.taskId,
              status: 'ACTIVE',
              isPaused: false,
            },
          });

          if (!existing) {
            const startTime = new Date();
            const durationMinutes = session.duration || 25;
            const remainingSeconds = durationMinutes * 60;
            const endTime = new Date(
              startTime.getTime() + remainingSeconds * 1000,
            );

            await this.prisma.pomodoroSession.create({
              data: {
                userId: session.userId,
                taskId: session.taskId,
                duration: durationMinutes,
                startTime,
                endTime,
                status: 'ACTIVE',
                isPaused: false,
                remainingSeconds,
              },
            });
          }
        }
      } catch (err) {
        console.error('Error processing expired Pomodoro session:', err);
      }
    }
  }

  onModuleInit(): void {
    // run every 15 seconds
    this._processorInterval = setInterval(() => {
      // call and ignore errors to avoid unhandled promise rejections
      this.handleExpiredSessions().catch(() => undefined);
    }, 15 * 1000);
  }

  onModuleDestroy(): void {
    if (this._processorInterval) {
      clearInterval(this._processorInterval);
      this._processorInterval = null;
    }
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

    // determine remainingSeconds if not provided using endTime
    let remaining = pauseDto.remainingSeconds;
    if (remaining === undefined || remaining === null) {
      if (session.endTime) {
        const now = new Date();
        remaining = Math.max(
          0,
          Math.round((session.endTime.getTime() - now.getTime()) / 1000),
        );
      } else {
        remaining = session.remainingSeconds ?? 0;
      }
    }

    return this.prisma.pomodoroSession.update({
      where: { id: sessionId },
      data: {
        isPaused: true,
        remainingSeconds: remaining,
        endTime: null,
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

    const startTime = new Date();
    const remaining = resumeDto.remainingSeconds ?? session.remainingSeconds ?? 0;
    const endTime = new Date(startTime.getTime() + remaining * 1000);

    return this.prisma.pomodoroSession.update({
      where: { id: sessionId },
      data: {
        isPaused: false,
        status: 'ACTIVE',
        startTime,
        endTime,
        remainingSeconds: remaining,
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

  async getSessions(userId: number) {
    // Return all sessions for the user, newest first
    const sessions = await this.prisma.pomodoroSession.findMany({
      where: { userId },
      include: { task: true },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    // compute remainingSeconds on-the-fly for active (not paused) sessions
    return sessions.map((s) => {
      if (s.status === 'ACTIVE' && !s.isPaused) {
        const end = s.endTime;
        const remaining = end
          ? Math.max(0, Math.round((end.getTime() - now.getTime()) / 1000))
          : (s.remainingSeconds ?? 0);
        return {
          ...s,
          remainingSeconds: remaining,
        };
      }
      return s;
    });
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

  private isActive(session: { status: string; isPaused: boolean }): boolean {
    return session.status === 'ACTIVE' && !session.isPaused;
  }
}
