import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { RestaurantsService } from './restaurants.service';

const timestamps = {
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

describe('RestaurantsService', () => {
  let service: RestaurantsService;
  const prisma = {
    restaurant: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    menuItem: { findMany: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        RestaurantsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = moduleRef.get(RestaurantsService);
  });

  it('returns restaurant details with its menu', async () => {
    prisma.restaurant.findUnique.mockResolvedValue({
      id: 'r1',
      name: 'Bella Napoli',
      description: 'Pizza',
      cuisine: 'Olasz',
      rating: 4.6,
      address: 'Budapest',
      imageUrl: null,
      ...timestamps,
      menuItems: [
        {
          id: 'm1',
          restaurantId: 'r1',
          name: 'Margherita',
          description: 'Classic',
          priceCents: 1190,
          isAvailable: true,
          isOnSale: false,
          compareAtPriceCents: null,
          imageUrl: null,
          allergens: ['glutén', 'tej'],
          caloriesKcal: 810,
          proteinGrams: 34,
          carbsGrams: 96,
          fatGrams: 26,
          ...timestamps,
        },
      ],
    });

    await expect(service.findOne('r1')).resolves.toEqual({
      id: 'r1',
      name: 'Bella Napoli',
      description: 'Pizza',
      cuisine: 'Olasz',
      rating: 4.6,
      address: 'Budapest',
      imageUrl: null,
      menu: [
        {
          id: 'm1',
          name: 'Margherita',
          description: 'Classic',
          priceCents: 1190,
          isAvailable: true,
          isOnSale: false,
          compareAtPriceCents: null,
          imageUrl: null,
          allergens: ['glutén', 'tej'],
          caloriesKcal: 810,
          proteinGrams: 34,
          carbsGrams: 96,
          fatGrams: 26,
        },
      ],
    });
  });

  it('throws 404 for an unknown restaurant', async () => {
    prisma.restaurant.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  describe('findAll', () => {
    const restaurant = (
      id: string,
      menuItems: {
        priceCents: number;
        isAvailable?: boolean;
        isOnSale?: boolean;
      }[],
    ) => ({
      id,
      name: id,
      description: '',
      cuisine: 'Olasz',
      rating: 4.6,
      address: '',
      imageUrl: null,
      ...timestamps,
      menuItems: menuItems.map((m) => ({
        isAvailable: true,
        isOnSale: false,
        ...m,
      })),
    });

    it('returns every restaurant with derived price level and deal flag', async () => {
      prisma.restaurant.findMany.mockResolvedValue([
        restaurant('cheap', [{ priceCents: 200_000, isOnSale: true }]),
      ]);

      const result = await service.findAll();

      expect(prisma.restaurant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
      expect(result[0]).toMatchObject({
        id: 'cheap',
        priceLevel: 1,
        hasDeals: true,
      });
    });

    it('translates the filters into one AND-ed database query', async () => {
      prisma.restaurant.findMany.mockResolvedValue([]);

      await service.findAll({
        q: 'ramen',
        cuisine: ['Japán', 'Olasz'],
        minRating: 4.5,
        maxRating: 4.9,
        onSale: true,
      });

      const contains = { contains: 'ramen', mode: 'insensitive' };
      expect(prisma.restaurant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: [
              // Search covers restaurant and dish names only.
              {
                OR: [
                  { name: contains },
                  { menuItems: { some: { name: contains } } },
                ],
              },
              { cuisine: { in: ['Japán', 'Olasz'] } },
              { rating: { gte: 4.5, lte: 4.9 } },
              { menuItems: { some: { isOnSale: true, isAvailable: true } } },
            ],
          },
        }),
      );
    });

    it('supports an open-ended rating range', async () => {
      prisma.restaurant.findMany.mockResolvedValue([]);

      await service.findAll({ maxRating: 4.5 });

      expect(prisma.restaurant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { AND: [{ rating: { lte: 4.5 } }] },
        }),
      );
    });

    it('filters by the derived price level after loading', async () => {
      prisma.restaurant.findMany.mockResolvedValue([
        restaurant('cheap', [{ priceCents: 200_000 }]),
        restaurant('pricey', [{ priceCents: 400_000 }]),
        restaurant('closed', [{ priceCents: 200_000, isAvailable: false }]),
      ]);

      const result = await service.findAll({ priceLevel: [3] });

      expect(result.map((r) => r.id)).toEqual(['pricey']);
    });
  });

  describe('listCuisines', () => {
    it('maps grouped counts to facets', async () => {
      prisma.restaurant.groupBy.mockResolvedValue([
        { cuisine: 'Japán', _count: { _all: 1 } },
        { cuisine: 'Olasz', _count: { _all: 2 } },
      ]);

      await expect(service.listCuisines()).resolves.toEqual([
        { cuisine: 'Japán', count: 1 },
        { cuisine: 'Olasz', count: 2 },
      ]);
    });
  });

  describe('findDeals', () => {
    const deal = (id: string) => ({
      id,
      restaurantId: 'r1',
      name: id,
      description: '',
      priceCents: 319_000,
      compareAtPriceCents: 399_000,
      isOnSale: true,
      isAvailable: true,
      imageUrl: null,
      ...timestamps,
      restaurant: {
        id: 'r1',
        name: 'Bella Napoli',
        cuisine: 'Olasz',
        rating: 4.6,
      },
    });

    it('only queries orderable discounted items', async () => {
      prisma.menuItem.findMany.mockResolvedValue([]);

      await service.findDeals();

      expect(prisma.menuItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            isOnSale: true,
            isAvailable: true,
            compareAtPriceCents: { not: null },
          },
        }),
      );
    });

    it('shuffles, limits and maps the deals', async () => {
      prisma.menuItem.findMany.mockResolvedValue([
        deal('a'),
        deal('b'),
        deal('c'),
      ]);

      const result = await service.findDeals(2, () => 0);

      // random() = 0 → [b, c, a]
      expect(result.map((d) => d.menuItemId)).toEqual(['b', 'c']);
      expect(result[0]).toEqual({
        menuItemId: 'b',
        name: 'b',
        imageUrl: null,
        priceCents: 319_000,
        compareAtPriceCents: 399_000,
        discountPercent: 20,
        restaurant: {
          id: 'r1',
          name: 'Bella Napoli',
          cuisine: 'Olasz',
          rating: 4.6,
        },
      });
    });
  });
});
