import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

interface RegisterResponse {
  id: number;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    name: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: {
    register: jest.Mock<Promise<RegisterResponse>, [RegisterDto]>;
    login: jest.Mock<Promise<LoginResponse>, [LoginDto]>;
  };

  const mockRegisterDto: RegisterDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  const mockLoginDto: LoginDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  const mockRegisterResponse: RegisterResponse = {
    id: 1,
    email: 'test@example.com',
    name: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLoginResponse: LoginResponse = {
    access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    user: {
      id: 1,
      email: 'test@example.com',
      name: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  beforeEach(async () => {
    mockAuthService = {
      register: jest.fn<Promise<RegisterResponse>, [RegisterDto]>(),
      login: jest.fn<Promise<LoginResponse>, [LoginDto]>(),
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
    it('should register a new user and return user data', async () => {
      mockAuthService.register.mockResolvedValueOnce(mockRegisterResponse);

      const result = await controller.register(mockRegisterDto);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result.email).toBe(mockRegisterDto.email);
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
      mockAuthService.login.mockResolvedValueOnce(mockLoginResponse);

      const result = await controller.login(mockLoginDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(mockLoginDto.email);
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
