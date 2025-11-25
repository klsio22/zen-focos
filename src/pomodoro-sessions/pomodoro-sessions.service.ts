import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TasksService } from '../tasks/tasks.service';
import { PauseSessionDto } from './dto/pause-session.dto';
import { ResumeSessionDto } from './dto/resume-session.dto';
import { SessionStatus } from '@prisma/client';

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
        status: SessionStatus.ACTIVE,
        isPaused: false,
        remainingSeconds: null,
      },
      include: {
        task: true,
      },
    });
  }

  async pauseSession(sessionId: number, pauseDto: PauseSessionDto, userId: number) {
    const session = await this.findSession(sessionId, userId);

    if (session.status !== SessionStatus.ACTIVE) {
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

  async resumeSession(sessionId: number, resumeDto: ResumeSessionDto, userId: number) {
    const session = await this.findSession(sessionId, userId);

    if (!session.isPaused) {
      throw new BadRequestException('Session is not paused');
    }

    return this.prisma.pomodoroSession.update({
      where: { id: sessionId },
      data: {
        isPaused: false,
        status: SessionStatus.ACTIVE,
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
        status: SessionStatus.COMPLETED,
        endTime: new Date(),
        isPaused: false,
        remainingSeconds: null,
      },
    });

    // Increment task's completed pomodoros
    const task = await this.tasksService.incrementCompletedPomodoros(session.taskId, userId);

    return {
      session: updatedSession,
      completedPomodoros: task.completedPomodoros,
    };
  }

  async cancelSession(sessionId: number, userId: number) {
    const session = await this.findSession(sessionId, userId);

    return this.prisma.pomodoroSession.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.CANCELLED,
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
        status: SessionStatus.ACTIVE,
      },
      include: {
        task: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const active = sessions.find(session => this.isActive(session)) || null;
    const paused = sessions.filter(session => session.isPaused);

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
    return session.status === SessionStatus.ACTIVE && !session.isPaused;
  }

  private async cancelActiveSessions(userId: number) {
    await this.prisma.pomodoroSession.updateMany({
      where: { 
        userId, 
        status: SessionStatus.ACTIVE,
      },
      data: { 
        status: SessionStatus.CANCELLED,
        endTime: new Date(),
        isPaused: false,
        remainingSeconds: null,
      },
    });
  }
}


  create(session: Omit<PomodoroSession, "id" | "status">) {
    // Aceita tanto `duration` quanto `durationMinutes` no payload
    const payloadAny = session as any;
    const durationMinutes =
      payloadAny.duration ?? payloadAny.durationMinutes ?? 25;
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
    const newSession = {
      ...session,
      id: this.generateId(),
      status: "running" as const,
      duration: durationMinutes,
      durationMinutes: durationMinutes,
      startTime,
      endTime,
    };
    this.sessions.push(newSession);
    return newSession;
  }

  /**
   * Returns remaining time in milliseconds and human-friendly information.
   * If `id` is provided, uses the matching session; otherwise uses the active session.
   */
  getRemainingTime(id?: string) {
    let session: PomodoroSession | undefined;
    if (id) {
      session = this.sessions.find((s) => s.id === id);
    } else {
      session = this.findActiveSession();
    }

    if (!session) throw new NotFoundException("Session not found");

    session.endTime ??= new Date(
      new Date(session.startTime).getTime() +
        (session.duration || 25) * 60000,
    );

    const now = new Date();
    const remainingMs =
      session.status === "running"
        ? session.endTime.getTime() - now.getTime()
        : 0;
    const remaining = Math.max(0, remainingMs);

    return {
      sessionId: session.id,
      status: session.status,
      estimatedEndTime: session.endTime,
      estimatedEndTimePtBr: session.endTime
        ? new Date(session.endTime).toLocaleString("pt-BR", {
            timeZone: "America/Sao_Paulo",
          })
        : null,
      startTimePtBr: session.startTime
        ? new Date(session.startTime).toLocaleString("pt-BR", {
            timeZone: "America/Sao_Paulo",
          })
        : null,
      remainingMs: remaining,
      remainingSeconds: Math.ceil(remaining / 1000),
      remainingMinutes: Math.ceil(remaining / 60000),
    };
  }

  findAll() {
    return this.sessions;
  }

  // User-less local mode: sessions are global in the in-memory store
  findByUserId(_userId?: string) {
    return this.sessions;
  }

  findActiveSession() {
    return this.sessions.find((session) => session.status === "running");
  }

  findOne(id: string) {
    const session = this.sessions.find((session) => session.id === id);
    if (!session) {
      throw new NotFoundException("Session not found");
    }
    return session;
  }

  completeSession(id: string) {
    const session = this.findOne(id);
    const updatedSession = {
      ...session,
      status: "completed" as const,
      endTime: new Date(),
    };
    const index = this.sessions.findIndex((s) => s.id === id);
    this.sessions[index] = updatedSession;
    
    // Increment task completed pomodoros if task exists
    try {
      const updatedTask = this.tasksService.incrementCompletedPomodoros(
        session.taskId,
      );

      // Decide break type: long after every 4 completed pomodoros
      const isLongBreak = updatedTask.completedPomodoros > 0 && updatedTask.completedPomodoros % 4 === 0;
      const breakDuration = isLongBreak ? 15 : 5;

      // Create a break scheduled to start now
      this.breaksService.create({
        sessionId: session.id,
        duration: breakDuration,
        type: isLongBreak ? 'long' : 'short',
        startTime: new Date(),
      });
    } catch (err) {
      console.warn('Failed to create break after session completion:', err);
    }

    return updatedSession;
  }

  cancelSession(id: string) {
    const session = this.findOne(id);
    const updatedSession = {
      ...session,
      status: "cancelled" as const,
      endTime: new Date(),
    };
    const index = this.sessions.findIndex((s) => s.id === id);
    this.sessions[index] = updatedSession;
    return updatedSession;
  }

  advanceToBreak(id: string) {
    const session = this.completeSession(id);
    
    // Find the break that was just created for this session
    const createdBreak = this.breaksService.findAll().find(b => b.sessionId === session.id && b.status === 'scheduled');
    
    if (createdBreak) {
      // Start the break immediately
      const startedBreak = this.breaksService.startBreak(createdBreak.id);
      return { session, break: startedBreak };
    }
    
    return { session, break: null };
  }

  remove(id: string) {
    const index = this.sessions.findIndex((session) => session.id === id);
    if (index === -1) throw new NotFoundException("Session not found");
    this.sessions.splice(index, 1);
  }

  getSessionStats() {
    const userSessions = this.findByUserId();
    const completedSessions = userSessions.filter(
      (s) => s.status === "completed",
    );

    return {
      totalSessions: completedSessions.length,
      totalFocusTime: completedSessions.reduce(
        (total, session) => total + session.duration,
        0,
      ),
      averageSessionLength:
        completedSessions.length > 0
          ? completedSessions.reduce(
              (total, session) => total + session.duration,
              0,
            ) / completedSessions.length
          : 0,
    };
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}
