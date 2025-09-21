import { Injectable, NotFoundException } from '@nestjs/common';
import { PomodoroSession } from './interfaces/pomodoro-session.interface';

@Injectable()
export class PomodoroSessionsService {
  private sessions: PomodoroSession[] = [];

  create(session: Omit<PomodoroSession, 'id' | 'status'>) {
    const newSession = {
      ...session,
      id: this.generateId(),
      status: 'running' as const,
      startTime: new Date(),
    };
    this.sessions.push(newSession);
    return newSession;
  }

  findAll() {
    return this.sessions;
  }

  findByUserId(userId: string) {
    return this.sessions.filter(session => session.userId === userId);
  }

  findActiveSession(userId: string) {
    return this.sessions.find(
      session => session.userId === userId && session.status === 'running',
    );
  }

  findOne(id: string) {
    const session = this.sessions.find(session => session.id === id);
    if (!session) throw new NotFoundException('Sessão não encontrada');
    return session;
  }

  completeSession(id: string) {
    const session = this.findOne(id);
    const updatedSession = {
      ...session,
      status: 'completed' as const,
      endTime: new Date(),
    };
    const index = this.sessions.findIndex(s => s.id === id);
    this.sessions[index] = updatedSession;
    return updatedSession;
  }

  cancelSession(id: string) {
    const session = this.findOne(id);
    const updatedSession = {
      ...session,
      status: 'cancelled' as const,
      endTime: new Date(),
    };
    const index = this.sessions.findIndex(s => s.id === id);
    this.sessions[index] = updatedSession;
    return updatedSession;
  }

  remove(id: string) {
    const index = this.sessions.findIndex(session => session.id === id);
    if (index === -1) throw new NotFoundException('Sessão não encontrada');
    this.sessions.splice(index, 1);
  }

  getSessionStats(userId: string) {
    const userSessions = this.findByUserId(userId);
    const completedSessions = userSessions.filter(s => s.status === 'completed');
    
    return {
      totalSessions: completedSessions.length,
      totalFocusTime: completedSessions.reduce((total, session) => total + session.duration, 0),
      averageSessionLength: completedSessions.length > 0 
        ? completedSessions.reduce((total, session) => total + session.duration, 0) / completedSessions.length 
        : 0,
    };
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}
