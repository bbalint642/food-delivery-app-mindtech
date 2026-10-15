import { ApiProperty } from '@nestjs/swagger';
import { MenuItem, Restaurant } from '../../generated/prisma/client';
import { discountPercent } from '../restaurant-catalog';

export class DealRestaurantDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Bella Napoli' })
  name!: string;

  @ApiProperty({ example: 'Olasz' })
  cuisine!: string;

  @ApiProperty({ example: 4.7 })
  rating!: number;
}

/** A discounted menu item shown in the deals carousel. */
export class DealDto {
  @ApiProperty({ format: 'uuid' })
  menuItemId!: string;

  @ApiProperty({ example: 'Pizza Diavola' })
  name!: string;

  @ApiProperty({ nullable: true, example: '/images/foods/pizza-diavola.webp' })
  imageUrl!: string | null;

  @ApiProperty({ example: 319000, description: 'Sale price in fillér (HUF).' })
  priceCents!: number;

  @ApiProperty({ example: 399000, description: 'List price in fillér (HUF).' })
  compareAtPriceCents!: number;

  @ApiProperty({ example: 20, description: 'Discount in whole percent.' })
  discountPercent!: number;

  @ApiProperty({ type: DealRestaurantDto })
  restaurant!: DealRestaurantDto;

  static fromEntity(
    item: MenuItem & {
      compareAtPriceCents: number;
      restaurant: Pick<Restaurant, 'id' | 'name' | 'cuisine' | 'rating'>;
    },
  ): DealDto {
    return {
      menuItemId: item.id,
      name: item.name,
      imageUrl: item.imageUrl,
      priceCents: item.priceCents,
      compareAtPriceCents: item.compareAtPriceCents,
      discountPercent: discountPercent(
        item.priceCents,
        item.compareAtPriceCents,
      ),
      restaurant: {
        id: item.restaurant.id,
        name: item.restaurant.name,
        cuisine: item.restaurant.cuisine,
        rating: Number(item.restaurant.rating),
      },
    };
  }
}
