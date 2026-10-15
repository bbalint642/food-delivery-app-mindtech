import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { Prisma, User } from '../generated/prisma/client';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { JwtPayload } from './types/jwt-payload';

jest.mock('bcrypt', () => ({
  hash: jest.fn((plain: string) => Promise.resolve(`hashed:${plain}`)),
  compare: jest.fn((plain: string, hash: string) =>
    Promise.resolve(hash === `hashed:${plain}`),
  ),
}));

const JWT_SECRET = 'test-secret-with-at-least-32-characters!';

const existingUser: User = {
  id: '6f1c2c38-2a8e-4c9b-9a0d-3f3b7b1f2a10',
  name: 'Jane Doe',
  email: 'jane@example.com',
  passwordHash: 'hashed:Secret123!',
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let usersService: jest.Mocked<
    Pick<UsersService, 'findByEmail' | 'findById' | 'create'>
  >;

  beforeEach(async () => {
    jest.clearAllMocks();
    usersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        {
          provide: JwtService,
          useValue: new JwtService({ secret: JWT_SECRET }),
        },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
    jwtService = moduleRef.get(JwtService);
  });

  describe('register', () => {
    const dto = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'Secret123!',
    };

    it('stores a hashed password and returns a token for the new user', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(existingUser);

      const result = await authService.register(dto);

      expect(usersService.create).toHaveBeenCalledWith({
        name: dto.name,
        email: dto.email,
        passwordHash: 'hashed:Secret123!',
      });
      expect(result.user).toEqual({
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        createdAt: existingUser.createdAt,
      });
      expect(result.user).not.toHaveProperty('passwordHash');

      const payload = await jwtService.verifyAsync<JwtPayload>(
        result.accessToken,
      );
      expect(payload).toMatchObject({
        sub: existingUser.id,
        email: existingUser.email,
      });
    });

    it('rejects an email that is already registered', async () => {
      usersService.findByEmail.mockResolvedValue(existingUser);

      await expect(authService.register(dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('maps a unique-constraint race to a conflict', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: 'test',
        }),
      );

      await expect(authService.register(dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('returns a token for valid credentials', async () => {
      usersService.findByEmail.mockResolvedValue(existingUser);

      const result = await authService.login({
        email: existingUser.email,
        password: 'Secret123!',
      });

      expect(result.tokenType).toBe('Bearer');
      expect(result.user.id).toBe(existingUser.id);
      await expect(
        jwtService.verifyAsync<JwtPayload>(result.accessToken),
      ).resolves.toMatchObject({ sub: existingUser.id });
    });

    it('rejects a wrong password', async () => {
      usersService.findByEmail.mockResolvedValue(existingUser);

      await expect(
        authService.login({ email: existingUser.email, password: 'Wrong123!' }),
      ).rejects.toThrow(new UnauthorizedException('Invalid email or password'));
    });

    it('rejects an unknown email with the same error, still comparing a hash', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'nobody@example.com',
          password: 'Secret123!',
        }),
      ).rejects.toThrow(new UnauthorizedException('Invalid email or password'));
      // A hash comparison runs even for unknown users to keep timing uniform.
      expect(bcrypt.compare).toHaveBeenCalledTimes(1);
    });
  });
});
