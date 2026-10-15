import { ApiProperty } from '@nestjs/swagger';
import { MenuItem, Restaurant } from '../../generated/prisma/client';
import { MenuItemDto } from './menu-item.dto';
import { RestaurantDto } from './restaurant.dto';

export class RestaurantDetailDto extends RestaurantDto {
  @ApiProperty({ type: [MenuItemDto] })
  menu!: MenuItemDto[];

  static fromEntityWithMenu(
    restaurant: Restaurant & { menuItems: MenuItem[] },
  ): RestaurantDetailDto {
    return {
      ...RestaurantDto.fromEntity(restaurant),
      menu: restaurant.menuItems.map((item) => MenuItemDto.fromEntity(item)),
    };
  }
}
