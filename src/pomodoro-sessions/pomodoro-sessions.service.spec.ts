import { Test, TestingModule } from '@nestjs/testing';
import { PomodoroSessionsService } from './pomodoro-sessions.service';

describe('PomodoroSessionsService', () => {
  let service: PomodoroSessionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PomodoroSessionsService],
    }).compile();

    service = module.get<PomodoroSessionsService>(PomodoroSessionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
