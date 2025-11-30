import { Test, TestingModule } from '@nestjs/testing';
import { PomodoroSessionsService } from './pomodoro-sessions.service';
import { PrismaService } from '../prisma/prisma.service';
import { TasksService } from '../tasks/tasks.service';
import { BadRequestException } from '@nestjs/common';

interface MockPomodoroSessionModel {
  findFirst: jest.Mock;
  findMany: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  deleteMany: jest.Mock;
}

interface MockPrismaServiceType {
  pomodoroSession: MockPomodoroSessionModel;
  task: {
    findUnique: jest.Mock;
    update: jest.Mock;
  };
  $transaction: jest.Mock;
}

interface MockTasksServiceType {
  findOne: jest.Mock;
  incrementCompletedPomodoros: jest.Mock;
}

describe('PomodoroSessionsService', () => {
  let service: PomodoroSessionsService;

  const mockSession = {
    id: 1,
    userId: 1,
    taskId: 1,
    duration: 25,
    startTime: new Date(),
    endTime: new Date(Date.now() + 25 * 60 * 1000),
    pausedAt: null,
    status: 'ACTIVE',
    isPaused: false,
    remainingSeconds: 1500,
    createdAt: new Date(),
    updatedAt: new Date(),
    task: {
      id: 1,
      userId: 1,
      title: 'Test Task',
      description: null,
      status: 'PENDING',
      estimatedPomodoros: 3,
      completedPomodoros: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  const mockTask = {
    id: 1,
    userId: 1,
    title: 'Test Task',
    description: null,
    status: 'PENDING',
    estimatedPomodoros: 3,
    completedPomodoros: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService: MockPrismaServiceType = {
    pomodoroSession: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    task: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(
      <T>(callback: (tx: MockPrismaServiceType) => Promise<T>): Promise<T> =>
        callback(mockPrismaService),
    ),
  };

  const mockTasksService: MockTasksServiceType = {
    findOne: jest.fn(),
    incrementCompletedPomodoros: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PomodoroSessionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    service = module.get<PomodoroSessionsService>(PomodoroSessionsService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    if (service['_processorInterval']) {
      clearInterval(service['_processorInterval']);
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startSession', () => {
    it('should create a new pomodoro session', async () => {
      mockTasksService.findOne.mockResolvedValueOnce(mockTask);
      mockPrismaService.pomodoroSession.findFirst.mockResolvedValueOnce(null);
      mockPrismaService.pomodoroSession.create.mockResolvedValueOnce(
        mockSession,
      );

      const result = await service.startSession(1, 1);

      expect(result.status).toBe('ACTIVE');
      expect(result.isPaused).toBe(false);
      expect(result.duration).toBe(25);
      expect(mockPrismaService.pomodoroSession.create).toHaveBeenCalled();
    });

    it('should throw error if task is already completed', async () => {
      const completedTask = {
        ...mockTask,
        completedPomodoros: 3,
        estimatedPomodoros: 3,
      };

      mockTasksService.findOne.mockResolvedValueOnce(completedTask);

      await expect(service.startSession(1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error if active session already exists', async () => {
      mockTasksService.findOne.mockResolvedValueOnce(mockTask);
      mockPrismaService.pomodoroSession.findFirst.mockResolvedValueOnce(
        mockSession,
      );

      await expect(service.startSession(1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('pauseSession', () => {
    it('should pause an active session', async () => {
      mockPrismaService.pomodoroSession.findFirst.mockResolvedValueOnce(
        mockSession,
      );
      mockPrismaService.pomodoroSession.update.mockResolvedValueOnce({
        ...mockSession,
        isPaused: true,
        pausedAt: new Date(),
        endTime: null,
      });

      const result = await service.pauseSession(1, 1);

      expect(result.isPaused).toBe(true);
      expect(result.pausedAt).not.toBeNull();
      expect(result.endTime).toBeNull();
    });

    it('should throw error if session not active', async () => {
      const inactiveSession = { ...mockSession, status: 'COMPLETED' };

      mockPrismaService.pomodoroSession.findFirst.mockResolvedValueOnce(
        inactiveSession,
      );

      await expect(service.pauseSession(1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('resumeSession', () => {
    it('should resume a paused session', async () => {
      const pausedSession = {
        ...mockSession,
        isPaused: true,
        pausedAt: new Date(Date.now() - 60 * 1000),
        endTime: null,
        remainingSeconds: 1500,
      };

      const resumedSession = {
        ...pausedSession,
        isPaused: false,
        pausedAt: null,
        endTime: new Date(Date.now() + 1440 * 1000),
        status: 'ACTIVE',
      };

      mockPrismaService.pomodoroSession.findFirst.mockResolvedValueOnce(
        pausedSession,
      );
      mockPrismaService.pomodoroSession.update.mockResolvedValueOnce(
        resumedSession,
      );

      const result = await service.resumeSession(1, 1);

      // Result can be session directly or { session, completedPomodoros }
      const session = 'session' in result ? result.session : result;
      expect(session.isPaused).toBe(false);
      expect(session.status).toBe('ACTIVE');
    });

    it('should complete session if remaining time elapsed', async () => {
      const pausedSessionWithZeroRemaining = {
        ...mockSession,
        isPaused: true,
        pausedAt: new Date(),
        endTime: null,
        remainingSeconds: 0, // Zero seconds remaining when paused
        status: 'ACTIVE',
      };

      mockPrismaService.pomodoroSession.findFirst.mockResolvedValueOnce(
        pausedSessionWithZeroRemaining,
      );
      mockPrismaService.pomodoroSession.update.mockResolvedValueOnce({
        ...pausedSessionWithZeroRemaining,
        status: 'COMPLETED',
        isPaused: false,
        pausedAt: null,
      });

      mockTasksService.incrementCompletedPomodoros.mockResolvedValueOnce({
        ...mockTask,
        completedPomodoros: 1,
      });

      const result = await service.resumeSession(1, 1);

      expect(result).toHaveProperty('session');
      expect(result).toHaveProperty('completedPomodoros');
    });
  });

  describe('completeSession', () => {
    it('should complete a session and increment task pomodoros', async () => {
      mockPrismaService.pomodoroSession.findFirst.mockResolvedValueOnce(
        mockSession,
      );
      mockPrismaService.pomodoroSession.update.mockResolvedValueOnce({
        ...mockSession,
        status: 'COMPLETED',
      });
      mockTasksService.incrementCompletedPomodoros.mockResolvedValueOnce({
        ...mockTask,
        completedPomodoros: 1,
      });

      const result = await service.completeSession(1, 1);

      expect(result.session.status).toBe('COMPLETED');
      expect(result.completedPomodoros).toBe(1);
      expect(mockTasksService.incrementCompletedPomodoros).toHaveBeenCalled();
    });
  });

  describe('cancelSession', () => {
    it('should cancel a session and mark task as CANCELLED if no active sessions remain and no completed pomodoros', async () => {
      const cancelledSession = {
        ...mockSession,
        status: 'CANCELLED',
        task: { ...mockTask, status: 'CANCELLED', completedPomodoros: 0 },
      };

      mockPrismaService.pomodoroSession.findFirst
        .mockResolvedValueOnce(mockSession) // findSession
        .mockResolvedValueOnce(null) // check for other active sessions
        .mockResolvedValueOnce(cancelledSession); // findFirst for cancelled session

      mockPrismaService.pomodoroSession.update.mockResolvedValueOnce({
        ...mockSession,
        status: 'CANCELLED',
      });

      mockPrismaService.task.findUnique.mockResolvedValueOnce({
        ...mockTask,
        completedPomodoros: 0,
      });

      mockPrismaService.task.update.mockResolvedValueOnce({
        ...mockTask,
        status: 'CANCELLED',
      });

      const result = await service.cancelSession(1, 1);

      expect(result.status).toBe('CANCELLED');
      expect(result.task.status).toBe('CANCELLED');
      expect(mockPrismaService.task.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'CANCELLED' },
      });
    });

    it('should cancel a session and keep task status IN_PROGRESS if there are completed pomodoros', async () => {
      const taskWithProgress = { ...mockTask, completedPomodoros: 1 };
      const cancelledSession = {
        ...mockSession,
        status: 'CANCELLED',
        task: { ...taskWithProgress, status: 'IN_PROGRESS' },
      };

      mockPrismaService.pomodoroSession.findFirst
        .mockResolvedValueOnce(mockSession) // findSession
        .mockResolvedValueOnce(null) // check for other active sessions
        .mockResolvedValueOnce(cancelledSession); // findFirst for cancelled session

      mockPrismaService.pomodoroSession.update.mockResolvedValueOnce({
        ...mockSession,
        status: 'CANCELLED',
      });

      mockPrismaService.task.findUnique.mockResolvedValueOnce(taskWithProgress);

      mockPrismaService.task.update.mockResolvedValueOnce({
        ...taskWithProgress,
        status: 'IN_PROGRESS',
      });

      const result = await service.cancelSession(1, 1);

      expect(result.status).toBe('CANCELLED');
      expect(mockPrismaService.task.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'IN_PROGRESS' },
      });
    });

    it('should not update task status if other active sessions still exist', async () => {
      const cancelledSession = {
        ...mockSession,
        status: 'CANCELLED',
      };

      mockPrismaService.pomodoroSession.findFirst
        .mockResolvedValueOnce(mockSession) // findSession
        .mockResolvedValueOnce(mockSession) // check for other active sessions - returns a session (not null)
        .mockResolvedValueOnce(cancelledSession); // findFirst for cancelled session

      mockPrismaService.pomodoroSession.update.mockResolvedValueOnce({
        ...mockSession,
        status: 'CANCELLED',
      });

      await service.cancelSession(1, 1);

      // Should NOT update task status because other active sessions still exist
      expect(mockPrismaService.task.update).not.toHaveBeenCalled();
    });
  });

  describe('getSessions', () => {
    it('should return all sessions for user ordered by newest first', async () => {
      mockPrismaService.pomodoroSession.findMany.mockResolvedValueOnce([
        mockSession,
      ]);

      const result = await service.getSessions(1);

      expect(Array.isArray(result)).toBe(true);
      expect(mockPrismaService.pomodoroSession.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: { task: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should compute remainingSeconds for active sessions', async () => {
      mockPrismaService.pomodoroSession.findMany.mockResolvedValueOnce([
        mockSession,
      ]);

      const result = await service.getSessions(1);

      expect(result[0].remainingSeconds).toBeGreaterThan(0);
    });
  });
});
