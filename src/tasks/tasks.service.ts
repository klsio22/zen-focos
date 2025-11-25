import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from '@prisma/generated';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUser(userId: number) {
    return this.prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  async findOne(id: number, userId: number) {
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
      include: {
        sessions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async create(createTaskDto: CreateTaskDto, userId: number) {
    const taskData = {
      ...createTaskDto,
      userId,
      completedPomodoros: createTaskDto.completedPomodoros || 0,
    };

    const task = await this.prisma.task.create({
      data: taskData,
    });

    // Auto-update status based on progress
    return this.updateTaskStatus(task.id);
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, userId: number) {
    await this.findOne(id, userId); // Verify ownership

    await this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
    });

    // Auto-update status based on progress
    return this.updateTaskStatus(id);
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId); // Verify ownership

    await this.prisma.task.delete({
      where: { id },
    });
  }

  async incrementCompletedPomodoros(id: number, userId: number) {
    await this.findOne(id, userId); // Verify ownership

    await this.prisma.task.update({
      where: { id },
      data: {
        completedPomodoros: {
          increment: 1,
        },
      },
    });

    return this.updateTaskStatus(id);
  }

  private async updateTaskStatus(taskId: number) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    let status: TaskStatus;
    if (task.completedPomodoros >= task.estimatedPomodoros) {
      status = TaskStatus.COMPLETED;
    } else if (task.completedPomodoros > 0) {
      status = TaskStatus.IN_PROGRESS;
    } else {
      status = TaskStatus.PENDING;
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: { status },
    });
  }

  async getTasksGroupedByStatus(userId: number) {
    const tasks = await this.findAllByUser(userId);

    return {
      pending: tasks.filter(
        (task) =>
          task.status === TaskStatus.PENDING &&
          task.completedPomodoros < task.estimatedPomodoros,
      ),
      inProgress: tasks.filter(
        (task) =>
          task.status === TaskStatus.IN_PROGRESS &&
          task.completedPomodoros < task.estimatedPomodoros,
      ),
      completed: tasks.filter(
        (task) =>
          task.status === TaskStatus.COMPLETED ||
          task.completedPomodoros >= task.estimatedPomodoros,
      ),
    };
  }
}
