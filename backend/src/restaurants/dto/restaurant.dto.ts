import { ApiProperty } from '@nestjs/swagger';
import { Restaurant } from '../../generated/prisma/client';

export class RestaurantDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Bella Napoli' })
  name!: string;

  @ApiProperty({ example: 'Wood-fired Neapolitan pizzas.' })
  description!: string;

  @ApiProperty({ example: 'Italian' })
  cuisine!: string;

  @ApiProperty({ example: '12 Király utca, Budapest' })
  address!: string;

  @ApiProperty({ type: String, nullable: true })
  imageUrl!: string | null;

  static fromEntity(restaurant: Restaurant): RestaurantDto {
    return {
      id: restaurant.id,
      name: restaurant.name,
      description: restaurant.description,
      cuisine: restaurant.cuisine,
      address: restaurant.address,
      imageUrl: restaurant.imageUrl,
    };
  }
}
