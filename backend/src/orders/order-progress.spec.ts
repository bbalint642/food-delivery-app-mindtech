import { OrderStatus } from '../generated/prisma/client';
import { OrderEventsService } from './order-events.service';
import { OrderProgressService } from './order-progress.service';
import { nextOrderStatus, ORDER_STATUS_STEP_MS } from './order-progress';
import { PrismaService } from '../prisma/prisma.service';

describe('nextOrderStatus', () => {
  it('walks the lifecycle one step at a time and stops when delivered', () => {
    expect(nextOrderStatus(OrderStatus.PENDING)).toBe(OrderStatus.CONFIRMED);
    expect(nextOrderStatus(OrderStatus.CONFIRMED)).toBe(OrderStatus.PREPARING);
    expect(nextOrderStatus(OrderStatus.PREPARING)).toBe(OrderStatus.DELIVERING);
    expect(nextOrderStatus(OrderStatus.DELIVERING)).toBe(OrderStatus.DELIVERED);
    expect(nextOrderStatus(OrderStatus.DELIVERED)).toBeNull();
  });
});

describe('OrderProgressService', () => {
  const now = new Date('2026-01-01T12:00:10.000Z');

  function createService() {
    const prisma = {
      order: {
        findMany: jest.fn().mockResolvedValue([]),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const events = { publish: jest.fn() };
    const service = new OrderProgressService(
      prisma as unknown as PrismaService,
      events as unknown as OrderEventsService,
    );
    return { service, prisma, events };
  }

  it('loads orders that have spent a full step on their current status', async () => {
    const { service, prisma } = createService();

    await service.advanceDueOrders(now);

    expect(prisma.order.findMany).toHaveBeenCalledWith({
      where: {
        status: { not: OrderStatus.DELIVERED },
        updatedAt: { lt: new Date(now.getTime() - ORDER_STATUS_STEP_MS) },
      },
      select: { id: true, status: true },
      orderBy: { updatedAt: 'asc' },
      take: 100,
    });
  });

  it('advances each due order by one status and publishes that step', async () => {
    const { service, prisma, events } = createService();
    prisma.order.findMany.mockResolvedValue([
      { id: 'order-1', status: OrderStatus.PENDING },
      { id: 'order-2', status: OrderStatus.PREPARING },
    ]);

    const advanced = await service.advanceDueOrders(now);

    expect(advanced).toBe(2);
    expect(prisma.order.updateMany).toHaveBeenNthCalledWith(1, {
      where: { id: 'order-1', status: OrderStatus.PENDING },
      data: { status: OrderStatus.CONFIRMED, updatedAt: now },
    });
    expect(prisma.order.updateMany).toHaveBeenNthCalledWith(2, {
      where: { id: 'order-2', status: OrderStatus.PREPARING },
      data: { status: OrderStatus.DELIVERING, updatedAt: now },
    });
    expect(events.publish).toHaveBeenNthCalledWith(1, {
      orderId: 'order-1',
      status: OrderStatus.CONFIRMED,
      updatedAt: now.toISOString(),
    });
    expect(events.publish).toHaveBeenNthCalledWith(2, {
      orderId: 'order-2',
      status: OrderStatus.DELIVERING,
      updatedAt: now.toISOString(),
    });
  });

  it('does not publish when the row was already moved', async () => {
    const { service, prisma, events } = createService();
    prisma.order.findMany.mockResolvedValue([
      { id: 'order-1', status: OrderStatus.PENDING },
    ]);
    prisma.order.updateMany.mockResolvedValue({ count: 0 });

    const advanced = await service.advanceDueOrders(now);

    expect(advanced).toBe(0);
    expect(events.publish).not.toHaveBeenCalled();
  });
});
