import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma, User } from '../generated/prisma/client';
import { UserDto } from '../users/dto/user.dto';
import { UsersService } from '../users/users.service';
import { BCRYPT_SALT_ROUNDS } from './auth.constants';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './types/jwt-payload';

@Injectable()
export class AuthService {
  /**
   * Hash compared against when the email is unknown, so that login takes
   * the same time whether or not the account exists (no user enumeration).
   */
  private dummyHash?: Promise<string>;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    if (await this.usersService.findByEmail(dto.email)) {
      throw this.emailTakenException();
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    let user: User;
    try {
      user = await this.usersService.create({
        name: dto.name,
        email: dto.email,
        passwordHash,
      });
    } catch (error) {
      // A concurrent registration with the same email won the race.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw this.emailTakenException();
      }
      throw error;
    }

    return this.createAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(dto.email);
    const passwordMatches = await bcrypt.compare(
      dto.password,
      user?.passwordHash ?? (await this.getDummyHash()),
    );

    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.createAuthResponse(user);
  }

  private async createAuthResponse(user: User): Promise<AuthResponseDto> {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      tokenType: 'Bearer',
      user: UserDto.fromEntity(user),
    };
  }

  private getDummyHash(): Promise<string> {
    this.dummyHash ??= bcrypt.hash('dummy-password', BCRYPT_SALT_ROUNDS);
    return this.dummyHash;
  }

  private emailTakenException(): ConflictException {
    return new ConflictException('Email is already registered');
  }
}
