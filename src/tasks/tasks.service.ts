import { Injectable, NotFoundException } from '@nestjs/common';
import { Task } from './interfaces/task.interface';

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  create(task: Task) {
    // Adicionar dados de criação
    const newTask = {
      ...task,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tasks.push(newTask);
    return newTask;
  }

  findAll() {
    return this.tasks;
  }

  findByUserId(userId: string) {
    return this.tasks.filter(task => task.userId === userId);
  }

  findOne(id: string) {
    const task = this.tasks.find(task => task.id === id);
    if (!task) throw new NotFoundException('Task não encontrada');
    return task;
  }

  update(id: string, data: Partial<Task>) {
    const task = this.findOne(id);
    const updatedTask = {
      ...task,
      ...data,
      updatedAt: new Date(),
    };
    const index = this.tasks.findIndex(t => t.id === id);
    this.tasks[index] = updatedTask;
    return updatedTask;
  }

  remove(id: string) {
    const index = this.tasks.findIndex(task => task.id === id);
    if (index === -1) throw new NotFoundException('Task não encontrada');
    this.tasks.splice(index, 1);
  }

  incrementCompletedPomodoros(id: string) {
    const task = this.findOne(id);
    return this.update(id, {
      completedPomodoros: task.completedPomodoros + 1,
      status: task.completedPomodoros + 1 >= task.estimatedPomodoros 
        ? 'completed' 
        : task.status,
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}
