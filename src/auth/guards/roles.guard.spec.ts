import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, Reflector],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access when no roles are required', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 1, email: 'test@example.com', role: 'USER' },
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should allow access when user has required role', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 1, email: 'admin@example.com', role: 'ADMIN' },
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should deny access when user does not have required role', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 1, email: 'user@example.com', role: 'USER' },
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should allow access when user has one of multiple required roles', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 1, email: 'user@example.com', role: 'USER' },
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;

    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['ADMIN', 'USER']);

    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });
});
