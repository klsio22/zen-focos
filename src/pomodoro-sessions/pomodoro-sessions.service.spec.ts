import { Test, TestingModule } from '@nestjs/testing';
import { PomodoroSessionsService } from './pomodoro-sessions.service';
import { PrismaService } from '../prisma/prisma.service';
import { TasksService } from '../tasks/tasks.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PomodoroSessionsService', () => {
  let service: PomodoroSessionsService;
  let prismaService: PrismaService;
  let tasksService: TasksService;

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

  const mockPrismaService = {
    pomodoroSession: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  const mockTasksService = {
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
    prismaService = module.get<PrismaService>(PrismaService);
    tasksService = module.get<TasksService>(TasksService);

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
      mockPrismaService.pomodoroSession.create.mockResolvedValueOnce(mockSession);

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

      mockPrismaService.pomodoroSession.findFirst.mockResolvedValueOnce(
        pausedSession,
      );
      mockPrismaService.pomodoroSession.update.mockResolvedValueOnce({
        ...pausedSession,
        isPaused: false,
        pausedAt: null,
        endTime: new Date(Date.now() + 1440 * 1000),
        status: 'ACTIVE',
      });

      const result = await service.resumeSession(1, 1);

      expect(result.isPaused).toBe(false);
      expect(result.status).toBe('ACTIVE');
    });

    it('should complete session if remaining time elapsed', async () => {
      const expiredPausedSession = {
        ...mockSession,
        isPaused: true,
        pausedAt: new Date(Date.now() - 2000 * 1000), // 2000 seconds ago
        endTime: null,
        remainingSeconds: 100, // Only 100 seconds stored
        status: 'ACTIVE',
      };

      mockPrismaService.pomodoroSession.findFirst.mockResolvedValueOnce(
        expiredPausedSession,
      );
      mockPrismaService.pomodoroSession.update.mockResolvedValueOnce({
        ...expiredPausedSession,
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
