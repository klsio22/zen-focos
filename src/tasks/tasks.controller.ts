import { Controller, Get, Post, Put, Patch, Delete, Param, Body, HttpCode } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from './interfaces/task.interface';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(201)
  create(@Body() body: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.tasksService.create(body as Task);
  }

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<Task>) {
    return this.tasksService.update(id, body);
  }

  @Patch(':id')
  partialUpdate(@Param('id') id: string, @Body() body: Partial<Task>) {
    return this.tasksService.update(id, body);
  }

  @Patch(':id/complete-pomodoro')
  completePomodoro(@Param('id') id: string) {
    return this.tasksService.incrementCompletedPomodoros(id);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    this.tasksService.remove(id);
  }
}
