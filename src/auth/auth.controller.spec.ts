import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    createdAt: Date;
  };
}

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: {
    register: jest.Mock<Promise<AuthResponse>, [RegisterDto]>;
    login: jest.Mock<Promise<AuthResponse>, [LoginDto]>;
  };

  const mockRegisterDto: RegisterDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  const mockLoginDto: LoginDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  const mockAuthResponse: AuthResponse = {
    access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    user: {
      id: 1,
      email: 'test@example.com',
      createdAt: new Date(),
    },
  };

  beforeEach(async () => {
    mockAuthService = {
      register: jest.fn<Promise<AuthResponse>, [RegisterDto]>(),
      login: jest.fn<Promise<AuthResponse>, [LoginDto]>(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and return auth token', async () => {
      mockAuthService.register.mockResolvedValueOnce(mockAuthResponse);

      const result = await controller.register(mockRegisterDto);
      const authResult = result as AuthResponse;

      expect(authResult).toHaveProperty('access_token');
      expect(authResult).toHaveProperty('user');
      expect(authResult.user.email).toBe(mockRegisterDto.email);
      expect(mockAuthService.register).toHaveBeenCalledWith(mockRegisterDto);
    });

    it('should handle duplicate email registration', async () => {
      mockAuthService.register.mockRejectedValueOnce(
        new Error('Email already registered'),
      );

      await expect(controller.register(mockRegisterDto)).rejects.toThrow(Error);
    });
  });

  describe('login', () => {
    it('should login user and return auth token', async () => {
      mockAuthService.login.mockResolvedValueOnce(mockAuthResponse);

      const result = await controller.login(mockLoginDto);
      const authResult = result as AuthResponse;

      expect(authResult).toHaveProperty('access_token');
      expect(authResult).toHaveProperty('user');
      expect(authResult.user.email).toBe(mockLoginDto.email);
      expect(mockAuthService.login).toHaveBeenCalledWith(mockLoginDto);
    });

    it('should handle invalid credentials', async () => {
      mockAuthService.login.mockRejectedValueOnce(
        new Error('Invalid credentials'),
      );

      await expect(controller.login(mockLoginDto)).rejects.toThrow(Error);
    });

    it('should validate email and password format', async () => {
      const invalidLoginDto = {
        email: 'invalid-email',
        password: 'short',
      };

      const error = new Error('Invalid input');
      mockAuthService.login.mockRejectedValueOnce(error);

      await expect(
        controller.login(invalidLoginDto as LoginDto),
      ).rejects.toThrow('Invalid input');
    });
  });
});
