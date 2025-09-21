import { Injectable, NotFoundException } from '@nestjs/common';
import { PomodoroSession } from './interfaces/pomodoro-session.interface';

@Injectable()
export class PomodoroSessionsService {
  private sessions: PomodoroSession[] = [];

  create(session: Omit<PomodoroSession, 'id' | 'status'>) {
    // Aceita tanto `duration` quanto `durationMinutes` no payload
    const payloadAny = session as any;
    const durationMinutes = payloadAny.duration ?? payloadAny.durationMinutes ?? 25;
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
    const newSession = {
      ...session,
      id: this.generateId(),
      status: 'running' as const,
      // padroniza internamente como `duration` (minutos)
      duration: durationMinutes,
      // manter também durationMinutes para compatibilidade com clientes
      durationMinutes: durationMinutes,
      startTime,
      endTime,
    };
    this.sessions.push(newSession);
    return newSession;
  }

  /**
   * Retorna o tempo restante em milissegundos e informações legíveis.
   * Se `id` for fornecido, usa a sessão correspondente; caso contrário, usa a sessão ativa (opcionalmente por userId).
   */
  getRemainingTime(id?: string, userId?: string) {
    let session: PomodoroSession | undefined;
    if (id) {
      session = this.sessions.find(s => s.id === id);
    } else {
      session = this.findActiveSession(userId);
    }

    if (!session) throw new NotFoundException('Sessão não encontrada');

    // Se não houver endTime, estimamos com base em startTime + duration
    session.endTime ??= new Date(new Date(session.startTime).getTime() + (session.duration || 25) * 60000);

    const now = new Date();
    const remainingMs = session.status === 'running' ? session.endTime.getTime() - now.getTime() : 0;
    const remaining = Math.max(0, remainingMs);

    return {
      sessionId: session.id,
      status: session.status,
      estimatedEndTime: session.endTime,
      estimatedEndTimePtBr: session.endTime
        ? new Date(session.endTime).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
        : null,
      startTimePtBr: session.startTime
        ? new Date(session.startTime).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
        : null,
      remainingMs: remaining,
      remainingSeconds: Math.ceil(remaining / 1000),
      remainingMinutes: Math.ceil(remaining / 60000),
    };
  }

  findAll() {
    return this.sessions;
  }

  findByUserId(userId?: string) {
    if (!userId) return this.sessions;
    return this.sessions.filter(session => session.userId === userId);
  }

  findActiveSession(userId?: string) {
    if (!userId) {
      return this.sessions.find(session => session.status === 'running');
    }
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

  getSessionStats(userId?: string) {
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
