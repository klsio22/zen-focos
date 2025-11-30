import { Test, TestingModule } from '@nestjs/testing';
import { PomodoroSessionsController } from './pomodoro-sessions.controller';
import { PomodoroSessionsService } from './pomodoro-sessions.service';

describe('PomodoroSessionsController', () => {
  let controller: PomodoroSessionsController;
  let service: PomodoroSessionsService;

  const mockRequest = {
    user: {
      id: 1,
      email: 'user@example.com',
    },
  };

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
      status: 'PENDING',
      estimatedPomodoros: 3,
      completedPomodoros: 0,
    },
  };

  const mockPomodoroSessionsService = {
    startSession: jest.fn(),
    pauseSession: jest.fn(),
    resumeSession: jest.fn(),
    completeSession: jest.fn(),
    cancelSession: jest.fn(),
    getSessions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PomodoroSessionsController],
      providers: [
        {
          provide: PomodoroSessionsService,
          useValue: mockPomodoroSessionsService,
        },
      ],
    }).compile();

    controller = module.get<PomodoroSessionsController>(
      PomodoroSessionsController,
    );
    service = module.get<PomodoroSessionsService>(PomodoroSessionsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('startSession', () => {
    it('should start a new pomodoro session', async () => {
      mockPomodoroSessionsService.startSession.mockResolvedValueOnce(
        mockSession,
      );

      const result = await controller.startSession(1, mockRequest as any);

      expect(result.status).toBe('ACTIVE');
      expect(mockPomodoroSessionsService.startSession).toHaveBeenCalledWith(
        1,
        1,
      );
    });
  });

  describe('pauseSession', () => {
    it('should pause an active session', async () => {
      const pausedSession = {
        ...mockSession,
        isPaused: true,
        pausedAt: new Date(),
        endTime: null,
      };

      mockPomodoroSessionsService.pauseSession.mockResolvedValueOnce(
        pausedSession,
      );

      const result = await controller.pauseSession(1, mockRequest as any);

      expect(result.isPaused).toBe(true);
      expect(result.pausedAt).not.toBeNull();
      expect(mockPomodoroSessionsService.pauseSession).toHaveBeenCalledWith(
        1,
        1,
      );
    });
  });

  describe('resumeSession', () => {
    it('should resume a paused session', async () => {
      const resumeResponse = {
        session: {
          ...mockSession,
          isPaused: false,
          pausedAt: null,
        },
        completedPomodoros: 1,
      };

      mockPomodoroSessionsService.resumeSession.mockResolvedValueOnce(
        resumeResponse,
      );

      const result = await controller.resumeSession(1, mockRequest as any);

      expect(result.session.isPaused).toBe(false);
      expect(result).toHaveProperty('completedPomodoros');
      expect(mockPomodoroSessionsService.resumeSession).toHaveBeenCalledWith(
        1,
        1,
      );
    });
  });

  describe('completeSession', () => {
    it('should complete a session', async () => {
      const completeResponse = {
        session: {
          ...mockSession,
          status: 'COMPLETED',
        },
        completedPomodoros: 1,
      };

      mockPomodoroSessionsService.completeSession.mockResolvedValueOnce(
        completeResponse,
      );

      const result = await controller.completeSession(1, mockRequest as any);

      expect(result.session.status).toBe('COMPLETED');
      expect(result).toHaveProperty('completedPomodoros');
      expect(mockPomodoroSessionsService.completeSession).toHaveBeenCalledWith(
        1,
        1,
      );
    });
  });

  describe('cancelSession', () => {
    it('should cancel a session', async () => {
      const cancelledSession = {
        ...mockSession,
        status: 'CANCELLED',
      };

      mockPomodoroSessionsService.cancelSession.mockResolvedValueOnce(
        cancelledSession,
      );

      const result = await controller.cancelSession(1, mockRequest as any);

      expect(result.status).toBe('CANCELLED');
      expect(mockPomodoroSessionsService.cancelSession).toHaveBeenCalledWith(
        1,
        1,
      );
    });
  });

  describe('getSessions', () => {
    it('should return all sessions for authenticated user', async () => {
      mockPomodoroSessionsService.getSessions.mockResolvedValueOnce([
        mockSession,
      ]);

      const result = await controller.getSessions(mockRequest as any);

      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toEqual(mockSession);
      expect(mockPomodoroSessionsService.getSessions).toHaveBeenCalledWith(1);
    });

    it('should return empty array when user has no sessions', async () => {
      mockPomodoroSessionsService.getSessions.mockResolvedValueOnce([]);

      const result = await controller.getSessions(mockRequest as any);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });
  });
});
