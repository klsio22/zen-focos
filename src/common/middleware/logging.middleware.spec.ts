import { Logger } from '@nestjs/common';
import { LoggingMiddleware } from './logging.middleware';
import { Request, Response } from 'express';

type ResponseListener = () => void;

describe('LoggingMiddleware', () => {
  let middleware: LoggingMiddleware;
  let loggerSpy: jest.SpyInstance;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let responseListeners: Record<string, ResponseListener[]>;

  beforeEach(() => {
    middleware = new LoggingMiddleware();
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

    responseListeners = {};

    mockRequest = {
      method: 'GET',
      url: '/test',
      user: { id: 1, email: 'test@example.com' },
    };

    mockResponse = {
      statusCode: 200,
      on: jest.fn((event: string, callback: ResponseListener) => {
        if (!responseListeners[event]) {
          responseListeners[event] = [];
        }
        responseListeners[event].push(callback);
        return mockResponse;
      }),
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should log request information on response finish', () => {
    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    // Simulate response finish event
    if (responseListeners['finish']) {
      responseListeners['finish'].forEach((callback) => callback());
    }

    expect(loggerSpy).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });

  it('should call next middleware', () => {
    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should include method, url, and status in log', () => {
    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    const finishListeners = responseListeners['finish'];
    if (finishListeners) {
      finishListeners.forEach((callback) => callback());
    }

    const logCalls = loggerSpy.mock.calls as Array<[string]>;
    const logMessage = logCalls[0]?.[0] || '';
    expect(logMessage).toContain('GET');
    expect(logMessage).toContain('/test');
    expect(logMessage).toContain('200');
  });

  it('should log with user information when available', () => {
    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    const finishListeners = responseListeners['finish'];
    if (finishListeners) {
      finishListeners.forEach((callback) => callback());
    }

    const logCalls = loggerSpy.mock.calls as Array<[string]>;
    const logMessage = logCalls[0]?.[0] || '';
    expect(logMessage).toContain('test@example.com');
  });
});
