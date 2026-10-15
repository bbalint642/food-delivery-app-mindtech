import { ApiProperty } from '@nestjs/swagger';
import { Restaurant } from '../../generated/prisma/client';

export class RestaurantDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Bella Napoli' })
  name!: string;

  @ApiProperty({ example: 'Wood-fired Neapolitan pizzas.' })
  description!: string;

  @ApiProperty({ example: 'Olasz' })
  cuisine!: string;

  @ApiProperty({ example: 4.7, minimum: 0, maximum: 5 })
  rating!: number;

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
      rating: Number(restaurant.rating),
      address: restaurant.address,
      imageUrl: restaurant.imageUrl,
    };
  }
}
