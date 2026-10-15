import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../generated/prisma/client';

/** Public representation of a user – never exposes the password hash. */
export class UserDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Jane Doe' })
  name!: string;

  @ApiProperty({ example: 'jane@example.com' })
  email!: string;

  @ApiProperty()
  createdAt!: Date;

  static fromEntity(user: User): UserDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
