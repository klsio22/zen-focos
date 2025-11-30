import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

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
    const task = await this.prisma.task.create({
      data: {
        userId,
        title: createTaskDto.title,
        description: createTaskDto.description,
        estimatedPomodoros: createTaskDto.estimatedPomodoros,
        completedPomodoros: createTaskDto.completedPomodoros || 0,
        status: 'PENDING',
      },
    });

    // Auto-update status based on progress
    return this.updateTaskStatus(task.id);
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, userId: number) {
    await this.findOne(id, userId); // Verify ownership

    const data: {
      title?: string;
      description?: string | null;
      estimatedPomodoros?: number;
      completedPomodoros?: number;
      status?: TaskStatus;
    } = {};

    if (updateTaskDto.title !== undefined) {
      data.title = updateTaskDto.title;
    }
    if (updateTaskDto.description !== undefined) {
      data.description = updateTaskDto.description;
    }
    if (updateTaskDto.estimatedPomodoros !== undefined) {
      data.estimatedPomodoros = updateTaskDto.estimatedPomodoros;
    }
    if (updateTaskDto.completedPomodoros !== undefined) {
      data.completedPomodoros = updateTaskDto.completedPomodoros;
    }
    if (
      updateTaskDto.status !== undefined &&
      ['PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(updateTaskDto.status)
    ) {
      data.status = updateTaskDto.status as TaskStatus;
    }

    await this.prisma.task.update({
      where: { id },
      data,
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
    const task = await this.findOne(id, userId); // Verify ownership

    // Prevent incrementing beyond estimated
    if (task.completedPomodoros >= task.estimatedPomodoros) {
      return task; // Return task as-is without incrementing
    }

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
      status = 'COMPLETED';
    } else if (task.completedPomodoros > 0) {
      status = 'IN_PROGRESS';
    } else {
      status = 'PENDING';
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
          task.status === 'PENDING' &&
          task.completedPomodoros < task.estimatedPomodoros,
      ),
      inProgress: tasks.filter(
        (task) =>
          task.status === 'IN_PROGRESS' &&
          task.completedPomodoros < task.estimatedPomodoros,
      ),
      completed: tasks.filter(
        (task) =>
          task.status === 'COMPLETED' ||
          task.completedPomodoros >= task.estimatedPomodoros,
      ),
    };
  }
}
