import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { NotFoundException } from '@nestjs/common';

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;

  const mockRequest = {
    user: {
      id: 1,
      email: 'user@example.com',
    },
  };

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
  };

  const mockTasksService = {
    create: jest.fn(),
    findAllByUser: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    resetPomodoros: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'New Description',
        estimatedPomodoros: 5,
      };

      mockTasksService.create.mockResolvedValueOnce(mockTask);

      const result = await controller.create(
        createTaskDto,
        mockRequest as any,
      );

      expect(result).toEqual(mockTask);
      expect(mockTasksService.create).toHaveBeenCalledWith(
        createTaskDto,
        mockRequest.user.id,
      );
    });
  });

  describe('findAll', () => {
    it('should return all tasks for authenticated user', async () => {
      mockTasksService.findAllByUser.mockResolvedValueOnce([mockTask]);

      const result = await controller.findAll(mockRequest as any);

      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toEqual(mockTask);
      expect(mockTasksService.findAllByUser).toHaveBeenCalledWith(
        mockRequest.user.id,
      );
    });
  });

  describe('findOne', () => {
    it('should return a specific task', async () => {
      mockTasksService.findOne.mockResolvedValueOnce(mockTask);

      const result = await controller.findOne(1, mockRequest as any);

      expect(result).toEqual(mockTask);
      expect(mockTasksService.findOne).toHaveBeenCalledWith(1, 1);
    });

    it('should throw NotFoundException if task not found', async () => {
      mockTasksService.findOne.mockRejectedValueOnce(
        new NotFoundException(),
      );

      await expect(
        controller.findOne(1, mockRequest as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updateDto = { title: 'Updated Title' };
      const updatedTask = { ...mockTask, title: 'Updated Title' };

      mockTasksService.update.mockResolvedValueOnce(updatedTask);

      const result = await controller.update(1, updateDto, mockRequest as any);

      expect(result.title).toBe('Updated Title');
      expect(mockTasksService.update).toHaveBeenCalledWith(1, updateDto, 1);
    });
  });

  describe('resetPomodoros', () => {
    it('should reset pomodoros and delete sessions', async () => {
      const resetTask = { ...mockTask, completedPomodoros: 0, status: 'PENDING' };

      mockTasksService.resetPomodoros.mockResolvedValueOnce(resetTask);

      const result = await controller.resetPomodoros(1, mockRequest as any);

      expect(result.completedPomodoros).toBe(0);
      expect(result.status).toBe('PENDING');
      expect(mockTasksService.resetPomodoros).toHaveBeenCalledWith(1, 1);
    });
  });
});
