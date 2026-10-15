import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RestaurantDetailDto } from './dto/restaurant-detail.dto';
import { RestaurantDto } from './dto/restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<RestaurantDto[]> {
    const restaurants = await this.prisma.restaurant.findMany({
      orderBy: { name: 'asc' },
    });
    return restaurants.map((restaurant) =>
      RestaurantDto.fromEntity(restaurant),
    );
  }

  async findOne(id: string): Promise<RestaurantDetailDto> {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: { menuItems: { orderBy: { name: 'asc' } } },
    });
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }
    return RestaurantDetailDto.fromEntityWithMenu(restaurant);
  }
}
