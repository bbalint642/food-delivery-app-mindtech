import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UserDto } from '../../users/dto/user.dto';

/** Injects the authenticated user (set by `JwtStrategy`) into a handler parameter. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserDto => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user as UserDto;
  },
);
