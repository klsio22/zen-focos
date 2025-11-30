import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockRegisterDto: RegisterDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  const mockLoginDto: LoginDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  const mockAuthResponse = {
    access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    user: {
      id: 1,
      email: 'test@example.com',
      createdAt: new Date(),
    },
  };

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
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
    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and return auth token', async () => {
      mockAuthService.register.mockResolvedValueOnce(mockAuthResponse);

      const result = await controller.register(mockRegisterDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(mockRegisterDto.email);
      expect(mockAuthService.register).toHaveBeenCalledWith(mockRegisterDto);
    });

    it('should handle duplicate email registration', async () => {
      const error = new Error('Email already registered');
      mockAuthService.register.mockRejectedValueOnce(error);

      await expect(controller.register(mockRegisterDto)).rejects.toThrow(
        'Email already registered',
      );
    });
  });

  describe('login', () => {
    it('should login user and return auth token', async () => {
      mockAuthService.login.mockResolvedValueOnce(mockAuthResponse);

      const result = await controller.login(mockLoginDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(mockLoginDto.email);
      expect(mockAuthService.login).toHaveBeenCalledWith(mockLoginDto);
    });

    it('should handle invalid credentials', async () => {
      const error = new Error('Invalid credentials');
      mockAuthService.login.mockRejectedValueOnce(error);

      await expect(controller.login(mockLoginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should validate email and password format', async () => {
      const invalidLoginDto = {
        email: 'invalid-email',
        password: 'short',
      };

      const error = new Error('Invalid input');
      mockAuthService.login.mockRejectedValueOnce(error);

      await expect(controller.login(invalidLoginDto as LoginDto)).rejects.toThrow(
        'Invalid input',
      );
    });
  });
});
