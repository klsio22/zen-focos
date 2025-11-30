import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TasksService } from '../tasks/tasks.service';

@Injectable()
export class PomodoroSessionsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PomodoroSessionsService.name);
  private _processorInterval: NodeJS.Timeout | null = null;
  private _processorRunning = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly tasksService: TasksService,
  ) {}

  async startSession(taskId: number, userId: number) {
    const task = await this.tasksService.findOne(taskId, userId);

    // Check if task is already completed
    if (task.completedPomodoros >= task.estimatedPomodoros) {
      throw new BadRequestException(
        'Task is already completed. All estimated Pomodoros have been finished.',
      );
    }

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
    // Prevent overlapping executions
    if (this._processorRunning) {
      this.logger.debug('Previous processor run still in progress, skipping');
      return;
    }

    this._processorRunning = true;
    const startTime = Date.now();
    this.logger.debug('Processor cycle started');

    try {
      const now = new Date();

      const expired = await this.prisma.pomodoroSession.findMany({
        where: {
          status: 'ACTIVE',
          isPaused: false,
          endTime: { lte: now },
        },
        include: { task: true },
      });

      if (!expired || expired.length === 0) {
        this.logger.debug('No expired sessions found');
        return;
      }

      this.logger.debug(`Processing ${expired.length} expired session(s)`);

      for (const session of expired) {
        try {
          await this.prisma.$transaction(async (tx) => {
            await tx.pomodoroSession.update({
              where: { id: session.id },
              data: {
                status: 'COMPLETED',
                endTime: session.endTime || now,
                isPaused: false,
                remainingSeconds: null,
                pausedAt: null,
              },
            });

            const task = await this.tasksService.incrementCompletedPomodoros(
              session.taskId,
              session.userId,
            );

            await this.maybeStartNextSession(session, task, tx);
          });
        } catch (err) {
          if (
            err instanceof Error &&
            err.message.includes('Unique constraint failed')
          ) {
            this.logger.warn(
              `Session rollover skipped: Active session already exists for task ${session.taskId}`,
            );
          } else {
            this.logger.error(
              `Error processing expired Pomodoro session ${session.id}:`,
              err instanceof Error ? err.message : String(err),
            );
          }
        }
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `Processor cycle completed successfully in ${duration}ms, processed ${expired.length} session(s)`,
      );
    } finally {
      this._processorRunning = false;
    }
  }

  private async maybeStartNextSession(
    session: {
      duration: number | null;
      userId: number;
      taskId: number;
    },
    task: { completedPomodoros: number; estimatedPomodoros: number },
    tx: Parameters<Parameters<typeof this.prisma.$transaction>[0]>[0],
  ) {
    if (task.completedPomodoros < task.estimatedPomodoros) {
      const existing = await tx.pomodoroSession.findFirst({
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
        const endTime = new Date(startTime.getTime() + remainingSeconds * 1000);

        await tx.pomodoroSession.create({
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

        this.logger.debug(
          `Auto-started new session for task ${session.taskId}`,
        );
      }
    }
  }

  onModuleInit(): void {
    this.logger.log('Initializing periodic session processor (15s interval)');
    this._processorInterval = setInterval(() => {
      this.handleExpiredSessions().catch((err) => {
        this.logger.error(
          'Fatal error in handleExpiredSessions',
          err instanceof Error ? err.stack : String(err),
        );
      });
    }, 15 * 1000);
    this.logger.debug('Periodic session processor started successfully');
  }

  onModuleDestroy(): void {
    if (this._processorInterval) {
      this.logger.log('Destroying periodic session processor');
      clearInterval(this._processorInterval);
      this._processorInterval = null;
    }
  }

  async pauseSession(sessionId: number, userId: number) {
    const session = await this.findSession(sessionId, userId);

    if (session.status !== 'ACTIVE') {
      throw new BadRequestException('Session is not active');
    }

    if (session.isPaused) {
      throw new BadRequestException('Session is already paused');
    }

    // compute remainingSeconds from endTime if available
    let remaining: number;
    if (session.endTime) {
      const now = new Date();
      remaining = Math.max(
        0,
        Math.round((session.endTime.getTime() - now.getTime()) / 1000),
      );
    } else {
      remaining = session.remainingSeconds ?? 0;
    }

    return this.prisma.pomodoroSession.update({
      where: { id: sessionId },
      data: {
        isPaused: true,
        remainingSeconds: remaining,
        pausedAt: new Date(),
        endTime: null,
      },
      include: {
        task: true,
      },
    });
  }

  async resumeSession(sessionId: number, userId: number) {
    const session = await this.findSession(sessionId, userId);

    if (!session.isPaused) {
      throw new BadRequestException('Session is not paused');
    }

    const now = new Date();

    // When paused, remaining time is frozen at storedRemaining
    const remaining = session.remainingSeconds ?? 0;

    // If remaining time is already 0 -> complete the session
    if (remaining <= 0) {
      // Calculate endTime for completed session
      let computedEndTime: Date = now;
      if (session.pausedAt !== null) {
        const pausedAtObj =
          session.pausedAt instanceof Date
            ? session.pausedAt
            : new Date(session.pausedAt as string | number);
        const pausedAtTime = Number(pausedAtObj.getTime());
        const remainingMs = Number((session.remainingSeconds ?? 0) * 1000);
        const endTimeArg: number = pausedAtTime + remainingMs;
        computedEndTime = new Date(endTimeArg);
      }

      // Use transaction to prevent race condition when auto-starting next session
      const result = await this.prisma.$transaction(async (tx) => {
        // mark session completed
        const completed = await tx.pomodoroSession.update({
          where: { id: sessionId },
          data: {
            status: 'COMPLETED',
            endTime: computedEndTime,
            isPaused: false,
            remainingSeconds: null,
            pausedAt: null,
          },
        });

        // increment task completed pomodoros
        const task = await this.tasksService.incrementCompletedPomodoros(
          session.taskId,
          userId,
        );

        // start next session if applicable
        await this.maybeStartNextSession(session, task, tx);

        return { completed, task };
      });

      return {
        session: result.completed,
        completedPomodoros: result.task.completedPomodoros,
      };
    }

    // otherwise resume normally and set endTime based on remainingSeconds
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + remaining * 1000);

    return this.prisma.pomodoroSession.update({
      where: { id: sessionId },
      data: {
        isPaused: false,
        status: 'ACTIVE',
        startTime,
        endTime,
        remainingSeconds: remaining,
        pausedAt: null,
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
        pausedAt: null,
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
    const session = await this.findSession(sessionId, userId);

    // Cancel the session
    await this.prisma.pomodoroSession.update({
      where: { id: sessionId },
      data: {
        status: 'CANCELLED',
        endTime: new Date(),
        isPaused: false,
        remainingSeconds: null,
        pausedAt: null,
      },
    });

    // Check if there are any OTHER active sessions left for this task
    const otherActiveSessions = await this.prisma.pomodoroSession.findFirst({
      where: {
        taskId: session.taskId,
        id: { not: sessionId }, // Exclude the cancelled session
        status: 'ACTIVE',
      },
    });

    // If no other active sessions exist, update task status to PENDING
    if (!otherActiveSessions) {
      await this.prisma.task.update({
        where: { id: session.taskId },
        data: { status: 'PENDING' },
      });
    }

    return this.prisma.pomodoroSession
      .findFirst({
        where: { id: sessionId },
        include: { task: true },
      })
      .then((result) => {
        if (!result) {
          throw new NotFoundException('Session not found after cancellation');
        }
        return result;
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

      // for paused sessions, remaining time is frozen at storedRemaining
      // no need to recalculate - just return as-is
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
}
