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
  const prisma = { restaurant: { findUnique: jest.fn(), findMany: jest.fn() } };

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
      cuisine: 'Italian',
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
          ...timestamps,
        },
      ],
    });

    await expect(service.findOne('r1')).resolves.toEqual({
      id: 'r1',
      name: 'Bella Napoli',
      description: 'Pizza',
      cuisine: 'Italian',
      address: 'Budapest',
      imageUrl: null,
      menu: [
        {
          id: 'm1',
          name: 'Margherita',
          description: 'Classic',
          priceCents: 1190,
          isAvailable: true,
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
});
