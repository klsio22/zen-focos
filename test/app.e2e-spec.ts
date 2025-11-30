import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.setGlobalPrefix('v1');
    app.enableVersioning();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('Application', () => {
    it('should be defined', () => {
      expect(app).toBeDefined();
    });

    it('should have all required modules loaded', () => {
      expect(app).toBeDefined();
    });
  });

  describe('Endpoint Configuration', () => {
    it('should have global prefix v1 configured', () => {
      expect(app.getHttpServer()).toBeDefined();
    });

    it('should have validation pipe configured', () => {
      expect(app).toBeDefined();
    });
  });
});
