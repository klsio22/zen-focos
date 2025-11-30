import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Response } from 'express';
import { of } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<unknown>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransformInterceptor],
    }).compile();

    interceptor =
      module.get<TransformInterceptor<unknown>>(TransformInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should transform response with correct structure', (done) => {
    const mockResponse = {
      statusCode: 200,
    } as unknown as Response;

    const mockContext = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as unknown as ExecutionContext;

    const mockData = { id: 1, name: 'Test' };
    const mockCallHandler: CallHandler = {
      handle: () => of(mockData),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
      expect(result).toHaveProperty('statusCode', 200);
      expect(result).toHaveProperty('message', 'OK');
      expect(result).toHaveProperty('data', mockData);
      expect(result).toHaveProperty('timestamp');
      done();
    });
  });

  it('should return correct message for 201 status code', (done) => {
    const mockResponse = {
      statusCode: 201,
    } as unknown as Response;

    const mockContext = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as unknown as ExecutionContext;

    const mockData = { id: 1, created: true };
    const mockCallHandler: CallHandler = {
      handle: () => of(mockData),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
      expect(result.message).toBe('Created');
      expect(result.statusCode).toBe(201);
      done();
    });
  });

  it('should return correct message for error status codes', (done) => {
    const mockResponse = {
      statusCode: 403,
    } as unknown as Response;

    const mockContext = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler: CallHandler = {
      handle: () => of(null),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
      expect(result.message).toBe('Forbidden');
      expect(result.statusCode).toBe(403);
      done();
    });
  });
});
