import { Controller, Get, Post, Param, Body, Delete, HttpCode } from '@nestjs/common';
import { PomodoroBreaksService } from './pomodoro-breaks.service';

@Controller('pomodoro-breaks')
export class PomodoroBreaksController {
  constructor(private readonly breaksService: PomodoroBreaksService) {}

  @Post()
  @HttpCode(201)
  create(@Body() body: any) {
    return this.breaksService.create(body);
  }

  @Get()
  findAll() {
    return this.breaksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.breaksService.findOne(id);
  }

  @Get('active')
  findActive() {
    return this.breaksService.findActiveBreak();
  }

  @Post(':id/start')
  startBreak(@Param('id') id: string) {
    return this.breaksService.startBreak(id);
  }

  @Post(':id/complete')
  completeBreak(@Param('id') id: string) {
    return this.breaksService.completeBreak(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.breaksService.remove(id);
    return { success: true };
  }
}
