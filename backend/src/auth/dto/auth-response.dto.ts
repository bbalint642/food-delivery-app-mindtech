import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../users/dto/user.dto';

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT to send as `Authorization: Bearer <token>`',
  })
  accessToken!: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType!: 'Bearer';

  @ApiProperty({ type: UserDto })
  user!: UserDto;
}
