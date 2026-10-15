import { ApiProperty } from '@nestjs/swagger';
import { MenuItem, Restaurant } from '../../generated/prisma/client';
import {
  hasActiveDeal,
  priceLevelFor,
  PRICE_LEVELS,
  type PriceLevel,
} from '../restaurant-catalog';
import { RestaurantDto } from './restaurant.dto';

type CatalogueMenuItem = Pick<
  MenuItem,
  'priceCents' | 'isAvailable' | 'isOnSale'
>;

/** A restaurant in the list, with values derived from its menu for filtering. */
export class RestaurantListItemDto extends RestaurantDto {
  @ApiProperty({
    enum: PRICE_LEVELS,
    nullable: true,
    description:
      'Price level derived from the average menu price (1 = cheapest … 3 = most expensive). Null when nothing can be ordered.',
  })
  priceLevel!: PriceLevel | null;

  @ApiProperty({
    description: 'True when at least one orderable item is on sale.',
  })
  hasDeals!: boolean;

  static fromEntityWithMenu(
    restaurant: Restaurant & { menuItems: CatalogueMenuItem[] },
  ): RestaurantListItemDto {
    return {
      ...RestaurantDto.fromEntity(restaurant),
      priceLevel: priceLevelFor(restaurant.menuItems),
      hasDeals: hasActiveDeal(restaurant.menuItems),
    };
  }
}
