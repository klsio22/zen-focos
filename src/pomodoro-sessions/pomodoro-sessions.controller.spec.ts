import { Test, TestingModule } from '@nestjs/testing';
import { PomodoroSessionsController } from './pomodoro-sessions.controller';

describe('PomodoroSessionsController', () => {
  let controller: PomodoroSessionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PomodoroSessionsController],
    }).compile();

    controller = module.get<PomodoroSessionsController>(
      PomodoroSessionsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
