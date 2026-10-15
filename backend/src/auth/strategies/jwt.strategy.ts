import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Env } from '../../config/env.validation';
import { UserDto } from '../../users/dto/user.dto';
import { UsersService } from '../../users/users.service';
import { JWT_ALGORITHM } from '../auth.constants';
import { JwtPayload } from '../types/jwt-payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService<Env, true>,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET', { infer: true }),
      algorithms: [JWT_ALGORITHM],
    });
  }

  /**
   * Runs after the signature and expiry are verified. Loading the user
   * makes tokens of deleted accounts invalid; the result becomes `request.user`.
   */
  async validate(payload: JwtPayload): Promise<UserDto> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return UserDto.fromEntity(user);
  }
}
