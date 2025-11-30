import { Test, TestingModule } from '@nestjs/testing';
import { CorsMiddleware } from './cors.middleware';
import { Request, Response } from 'express';

describe('CorsMiddleware', () => {
  let middleware: CorsMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CorsMiddleware],
    }).compile();

    middleware = module.get<CorsMiddleware>(CorsMiddleware);

    mockRequest = {
      method: 'OPTIONS',
      headers: {
        origin: 'http://localhost:3000',
      },
    };

    mockResponse = {
      header: jest.fn().mockReturnThis(),
      sendStatus: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();

    // Mock environment variable
    process.env.ALLOWED_ORIGINS = 'http://localhost:3000,http://localhost:3001';
  });

  afterEach(() => {
    delete process.env.ALLOWED_ORIGINS;
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should set CORS headers for allowed origin', () => {
    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.header).toHaveBeenCalledWith(
      'Access-Control-Allow-Origin',
      'http://localhost:3000',
    );
    expect(mockResponse.header).toHaveBeenCalledWith(
      'Access-Control-Allow-Credentials',
      'true',
    );
  });

  it('should set correct methods in CORS headers', () => {
    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.header).toHaveBeenCalledWith(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    );
  });

  it('should respond with 200 for OPTIONS requests', () => {
    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.sendStatus).toHaveBeenCalledWith(200);
  });

  it('should call next for non-OPTIONS requests', () => {
    mockRequest.method = 'GET';

    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should not set CORS headers for disallowed origin', () => {
    mockRequest.headers = {
      origin: 'http://malicious.com',
    };

    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    const originHeaders = (mockResponse.header as jest.Mock).mock.calls.filter(
      (call: Array<string>) => call[0] === 'Access-Control-Allow-Origin',
    );
    expect(originHeaders).toHaveLength(0);
  });
});
