import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { OrderStatus } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

const USER_ID = '0b6f8a52-1c1e-4c43-9d0e-4b8f6f7f1a01';
const RESTAURANT_ID = '2c1d9f0e-5b7a-4f3e-8a6d-1e2f3a4b5c6d';
const PIZZA_ID = '9a8b7c6d-5e4f-4a3b-9c2d-1e0f9a8b7c6d';
const TIRAMISU_ID = '1f2e3d4c-5b6a-4978-8a9b-0c1d2e3f4a5b';

const menuItems = [
  { id: PIZZA_ID, name: 'Pizza', priceCents: 1190, isAvailable: true },
  { id: TIRAMISU_ID, name: 'Tiramisù', priceCents: 650, isAvailable: true },
];

function createPrismaMock() {
  const tx = {
    restaurant: { findUnique: jest.fn() },
    menuItem: { findMany: jest.fn() },
    order: { create: jest.fn() },
  };
  return {
    tx,
    order: { findFirst: jest.fn() },
    $transaction: jest.fn((callback: (client: typeof tx) => unknown) =>
      callback(tx),
    ),
  };
}

function storedOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: 'order-1',
    userId: USER_ID,
    restaurantId: RESTAURANT_ID,
    status: OrderStatus.PENDING,
    totalCents: 3030,
    createdAt: new Date('2026-01-01T12:00:00Z'),
    updatedAt: new Date('2026-01-01T12:00:00Z'),
    restaurant: { id: RESTAURANT_ID, name: 'Bella Napoli' },
    items: [
      {
        id: 'line-1',
        orderId: 'order-1',
        menuItemId: PIZZA_ID,
        name: 'Pizza',
        unitPriceCents: 1190,
        quantity: 2,
      },
      {
        id: 'line-2',
        orderId: 'order-1',
        menuItemId: TIRAMISU_ID,
        name: 'Tiramisù',
        unitPriceCents: 650,
        quantity: 1,
      },
    ],
    ...overrides,
  };
}

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const moduleRef = await Test.createTestingModule({
      providers: [OrdersService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(OrdersService);
  });

  describe('create', () => {
    const dto: CreateOrderDto = {
      restaurantId: RESTAURANT_ID,
      items: [
        { menuItemId: PIZZA_ID, quantity: 2 },
        { menuItemId: TIRAMISU_ID, quantity: 1 },
      ],
    };

    it('creates a PENDING order with server-side prices in one transaction', async () => {
      prisma.tx.restaurant.findUnique.mockResolvedValue({ id: RESTAURANT_ID });
      prisma.tx.menuItem.findMany.mockResolvedValue(menuItems);
      prisma.tx.order.create.mockResolvedValue(storedOrder());

      const result = await service.create(USER_ID, dto);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      // Menu lookup is scoped to the ordered restaurant.
      expect(prisma.tx.menuItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            restaurantId: RESTAURANT_ID,
            id: { in: [PIZZA_ID, TIRAMISU_ID] },
          },
        }),
      );
      expect(prisma.tx.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            userId: USER_ID,
            restaurantId: RESTAURANT_ID,
            status: OrderStatus.PENDING,
            totalCents: 3030,
            items: {
              create: [
                {
                  menuItemId: PIZZA_ID,
                  name: 'Pizza',
                  unitPriceCents: 1190,
                  quantity: 2,
                },
                {
                  menuItemId: TIRAMISU_ID,
                  name: 'Tiramisù',
                  unitPriceCents: 650,
                  quantity: 1,
                },
              ],
            },
          },
        }),
      );
      expect(result).toMatchObject({
        id: 'order-1',
        status: OrderStatus.PENDING,
        totalCents: 3030,
        restaurant: { id: RESTAURANT_ID, name: 'Bella Napoli' },
      });
      expect(result.items[0].lineTotalCents).toBe(2380);
    });

    it('returns 404 for an unknown restaurant', async () => {
      prisma.tx.restaurant.findUnique.mockResolvedValue(null);

      await expect(service.create(USER_ID, dto)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prisma.tx.order.create).not.toHaveBeenCalled();
    });

    it('returns 400 when an item does not belong to the restaurant', async () => {
      prisma.tx.restaurant.findUnique.mockResolvedValue({ id: RESTAURANT_ID });
      // Only the pizza is found within this restaurant.
      prisma.tx.menuItem.findMany.mockResolvedValue([menuItems[0]]);

      await expect(service.create(USER_ID, dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(prisma.tx.order.create).not.toHaveBeenCalled();
    });
  });

  describe('findOneForUser', () => {
    it('only looks up orders owned by the user', async () => {
      prisma.order.findFirst.mockResolvedValue(storedOrder());

      const result = await service.findOneForUser('order-1', USER_ID);

      expect(prisma.order.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'order-1', userId: USER_ID } }),
      );
      expect(result.id).toBe('order-1');
    });

    it("returns 404 for another customer's (or a missing) order", async () => {
      prisma.order.findFirst.mockResolvedValue(null);

      await expect(
        service.findOneForUser('order-1', 'someone-else'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
