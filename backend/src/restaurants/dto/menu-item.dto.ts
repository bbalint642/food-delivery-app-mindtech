import { ApiProperty } from '@nestjs/swagger';
import { MenuItem } from '../../generated/prisma/client';

export class MenuItemDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Pizza Margherita' })
  name!: string;

  @ApiProperty({ example: 'San Marzano tomato, fior di latte, basil.' })
  description!: string;

  @ApiProperty({
    example: 1190,
    description: 'Unit price in cents (EUR).',
  })
  priceCents!: number;

  @ApiProperty({ description: 'Unavailable items cannot be ordered.' })
  isAvailable!: boolean;

  static fromEntity(item: MenuItem): MenuItemDto {
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      priceCents: item.priceCents,
      isAvailable: item.isAvailable,
    };
  }
}
