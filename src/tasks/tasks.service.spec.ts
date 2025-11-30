import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('TasksService', () => {
  let service: TasksService;

  const mockTask = {
    id: 1,
    userId: 1,
    title: 'Test Task',
    description: 'Test Description',
    status: 'PENDING',
    estimatedPomodoros: 3,
    completedPomodoros: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    sessions: [],
  };

  const mockPrismaService = {
    task: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllByUser', () => {
    it('should return all tasks for a user', async () => {
      mockPrismaService.task.findMany.mockResolvedValueOnce([mockTask]);

      const result = await service.findAllByUser(1);

      expect(result).toEqual([mockTask]);
      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        orderBy: { createdAt: 'desc' },
        include: {
          sessions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a task by id and userId', async () => {
      mockPrismaService.task.findFirst.mockResolvedValueOnce(mockTask);

      const result = await service.findOne(1, 1);

      expect(result).toEqual(mockTask);
      expect(mockPrismaService.task.findFirst).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
        include: {
          sessions: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    });

    it('should throw NotFoundException if task not found', async () => {
      mockPrismaService.task.findFirst.mockResolvedValueOnce(null);

      await expect(service.findOne(999, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new task and update status to PENDING', async () => {
      const createTaskDto = {
        title: 'New Task',
        description: 'New Description',
        estimatedPomodoros: 5,
      };

      mockPrismaService.task.create.mockResolvedValueOnce({
        ...mockTask,
        ...createTaskDto,
        estimatedPomodoros: 5,
      });

      mockPrismaService.task.findUnique.mockResolvedValueOnce({
        ...mockTask,
        ...createTaskDto,
        estimatedPomodoros: 5,
      });

      mockPrismaService.task.update.mockResolvedValueOnce({
        ...mockTask,
        ...createTaskDto,
        estimatedPomodoros: 5,
        status: 'PENDING',
      });

      const result = await service.create(createTaskDto, 1);

      expect(result.title).toBe(createTaskDto.title);
      expect(mockPrismaService.task.create).toHaveBeenCalled();
    });
  });

  describe('incrementCompletedPomodoros', () => {
    it('should increment completedPomodoros and auto-update status', async () => {
      const taskWithProgress = {
        ...mockTask,
        completedPomodoros: 0,
      };

      mockPrismaService.task.findFirst.mockResolvedValueOnce(taskWithProgress);
      mockPrismaService.task.findUnique.mockResolvedValueOnce({
        ...taskWithProgress,
        completedPomodoros: 1,
        status: 'IN_PROGRESS',
      });
      mockPrismaService.task.update.mockResolvedValueOnce({
        ...taskWithProgress,
        completedPomodoros: 1,
        status: 'IN_PROGRESS',
      });

      const result = await service.incrementCompletedPomodoros(1, 1);

      expect(mockPrismaService.task.update).toHaveBeenCalled();
    });

    it('should not increment if already at estimated pomodoros', async () => {
      const completedTask = {
        ...mockTask,
        completedPomodoros: 3,
        estimatedPomodoros: 3,
      };

      mockPrismaService.task.findFirst.mockResolvedValueOnce(completedTask);

      const result = await service.incrementCompletedPomodoros(1, 1);

      // Should return without incrementing
      expect(result.completedPomodoros).toBe(3);
      expect(mockPrismaService.task.update).not.toHaveBeenCalled();
    });

    it('should update status to COMPLETED when all pomodoros are done', async () => {
      const almostComplete = {
        ...mockTask,
        completedPomodoros: 2,
        estimatedPomodoros: 3,
      };

      mockPrismaService.task.findFirst.mockResolvedValueOnce(almostComplete);
      mockPrismaService.task.findUnique.mockResolvedValueOnce({
        ...almostComplete,
        completedPomodoros: 3,
      });
      mockPrismaService.task.update.mockResolvedValueOnce({
        ...almostComplete,
        completedPomodoros: 3,
        status: 'COMPLETED',
      });

      await service.incrementCompletedPomodoros(1, 1);

      const lastCall =
        mockPrismaService.task.update.mock.calls[
          mockPrismaService.task.update.mock.calls.length - 1
        ][0];
      expect(lastCall.data.status).toBe('COMPLETED');
    });
  });

  describe('resetPomodoros', () => {
    it('should reset completedPomodoros to 0 and delete sessions', async () => {
      mockPrismaService.task.findFirst.mockResolvedValueOnce(mockTask);
      mockPrismaService.task.findUnique.mockResolvedValueOnce({
        ...mockTask,
        completedPomodoros: 0,
      });
      mockPrismaService.task.update.mockResolvedValueOnce({
        ...mockTask,
        completedPomodoros: 0,
        status: 'PENDING',
      });

      await service.resetPomodoros(1, 1);

      expect(mockPrismaService.task.update).toHaveBeenCalled();
    });
  });
});
