import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CuisineFacetDto } from './dto/cuisine-facet.dto';
import { DealDto } from './dto/deal.dto';
import { ListRestaurantsQueryDto } from './dto/list-restaurants-query.dto';
import { RestaurantDetailDto } from './dto/restaurant-detail.dto';
import { RestaurantListItemDto } from './dto/restaurant-list-item.dto';
import { DEFAULT_DEALS_LIMIT } from './dto/deals-query.dto';
import { shuffled } from './restaurant-catalog';

@Injectable()
export class RestaurantsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lists restaurants matching the (optional) filters. Text, cuisine,
   * rating and sale filters run in the database; the price level is derived
   * from the menu, so it is applied after loading the matching rows.
   */
  async findAll(
    query: ListRestaurantsQueryDto = {},
  ): Promise<RestaurantListItemDto[]> {
    const restaurants = await this.prisma.restaurant.findMany({
      where: this.buildWhere(query),
      include: {
        menuItems: {
          select: { priceCents: true, isAvailable: true, isOnSale: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const items = restaurants.map((restaurant) =>
      RestaurantListItemDto.fromEntityWithMenu(restaurant),
    );

    const { priceLevel } = query;
    if (!priceLevel?.length) return items;
    return items.filter(
      (item) =>
        item.priceLevel !== null && priceLevel.includes(item.priceLevel),
    );
  }

  /** Every cuisine in the catalogue with its restaurant count, A–Z. */
  async listCuisines(): Promise<CuisineFacetDto[]> {
    const groups = await this.prisma.restaurant.groupBy({
      by: ['cuisine'],
      _count: { _all: true },
      orderBy: { cuisine: 'asc' },
    });
    return groups.map((group) => ({
      cuisine: group.cuisine,
      count: group._count._all,
    }));
  }

  /**
   * Orderable discounted items in random order. The catalogue is small, so
   * all deals are loaded and shuffled in memory; a large catalogue would use
   * `ORDER BY random() LIMIT n` in the database instead.
   */
  async findDeals(
    limit = DEFAULT_DEALS_LIMIT,
    random: () => number = Math.random,
  ): Promise<DealDto[]> {
    const items = await this.prisma.menuItem.findMany({
      where: {
        isOnSale: true,
        isAvailable: true,
        compareAtPriceCents: { not: null },
      },
      include: {
        restaurant: {
          select: { id: true, name: true, cuisine: true, rating: true },
        },
      },
    });

    return shuffled(items, random)
      .slice(0, limit)
      .map((item) =>
        DealDto.fromEntity({
          ...item,
          compareAtPriceCents: item.compareAtPriceCents as number,
        }),
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

  private buildWhere(
    query: ListRestaurantsQueryDto,
  ): Prisma.RestaurantWhereInput {
    const conditions: Prisma.RestaurantWhereInput[] = [];

    if (query.q) {
      // Restaurant name or dish name only, so a word that merely appears in
      // a description does not produce surprising matches.
      const contains = { contains: query.q, mode: 'insensitive' } as const;
      conditions.push({
        OR: [{ name: contains }, { menuItems: { some: { name: contains } } }],
      });
    }
    if (query.cuisine?.length) {
      conditions.push({ cuisine: { in: query.cuisine } });
    }
    if (query.minRating !== undefined || query.maxRating !== undefined) {
      conditions.push({
        rating: {
          ...(query.minRating !== undefined && { gte: query.minRating }),
          ...(query.maxRating !== undefined && { lte: query.maxRating }),
        },
      });
    }
    if (query.onSale) {
      conditions.push({
        menuItems: { some: { isOnSale: true, isAvailable: true } },
      });
    }

    return conditions.length > 0 ? { AND: conditions } : {};
  }
}
