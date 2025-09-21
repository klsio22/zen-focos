import { Injectable, NotFoundException } from '@nestjs/common';
import { PomodoroBreak } from './interfaces/pomodoro-break.interface';

@Injectable()
export class PomodoroBreaksService {
  private readonly breaks: PomodoroBreak[] = [];

  create(b: Omit<PomodoroBreak, 'id' | 'status' | 'startTime' | 'endTime'> & { startTime?: Date }) {
    const start = b.startTime ?? new Date();
    const end = new Date(start.getTime() + (b.duration || 5) * 60000);
    const nb: PomodoroBreak = {
      ...b,
      id: this.generateId(),
      startTime: start,
      endTime: end,
      status: 'scheduled',
    } as PomodoroBreak;
    this.breaks.push(nb);
    return nb;
  }

  findAll() {
    return this.breaks;
  }

  findOne(id: string) {
    const br = this.breaks.find(b => b.id === id);
    if (!br) throw new NotFoundException('Break not found');
    return br;
  }

  startBreak(id: string) {
    const br = this.findOne(id);
    const updated = { ...br, status: 'running' as const, startTime: new Date() };
    const idx = this.breaks.findIndex(b => b.id === id);
    this.breaks[idx] = updated;
    return updated;
  }

  completeBreak(id: string) {
    const br = this.findOne(id);
    const updated = { ...br, status: 'completed' as const, endTime: new Date() };
    const idx = this.breaks.findIndex(b => b.id === id);
    this.breaks[idx] = updated;
    return updated;
  }

  findActiveBreak() {
    return this.breaks.find(b => b.status === 'running');
  }

  remove(id: string) {
    const idx = this.breaks.findIndex(b => b.id === id);
    if (idx === -1) throw new NotFoundException('Break not found');
    this.breaks.splice(idx, 1);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}
