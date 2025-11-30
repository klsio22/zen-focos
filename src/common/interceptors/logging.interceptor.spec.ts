import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { of } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let loggerSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggingInterceptor],
    }).compile();

    interceptor = module.get<LoggingInterceptor>(LoggingInterceptor);

    // Spy on logger
    loggerSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should log request and response', (done) => {
    const mockRequest = {
      method: 'GET',
      url: '/test',
      body: {},
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler: CallHandler = {
      handle: () => of({ data: 'test' }),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe(() => {
      expect(loggerSpy).toHaveBeenCalled();
      done();
    });
  });

  it('should sanitize password in request body', (done) => {
    const mockRequest = {
      method: 'POST',
      url: '/auth/login',
      body: { email: 'test@example.com', password: 'secret123' },
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler: CallHandler = {
      handle: () => of({ success: true }),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe(() => {
      const debugCalls = loggerSpy.mock.calls as Array<[string]>;
      const hasPasswordLog = debugCalls.some((call) =>
        String(call[0]).includes('***'),
      );
      expect(hasPasswordLog).toBe(true);
      done();
    });
  });
});
