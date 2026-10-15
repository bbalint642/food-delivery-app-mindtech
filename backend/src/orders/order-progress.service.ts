import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { interval, map, merge, Observable, of } from 'rxjs';
import { OrderStatus } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  OrderEventsService,
  OrderStatusEvent,
  OrderStreamMessage,
} from './order-events.service';
import {
  nextOrderStatus,
  ORDER_PROGRESS_TICK_MS,
  ORDER_STATUS_STEP_MS,
} from './order-progress';

/** Keeps the SSE connection alive while an order is waiting on its next step. */
const ORDER_STREAM_HEARTBEAT_MS = 15_000;

const DUE_ORDER_BATCH = 100;

/**
 * Moves orders through their lifecycle without an admin panel, and exposes
 * a per-order event stream for the customer who is watching.
 */
@Injectable()
export class OrderProgressService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OrderProgressService.name);
  private timer: NodeJS.Timeout | undefined;
  private ticking = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly events: OrderEventsService,
  ) {}

  onModuleInit(): void {
    this.timer = setInterval(() => {
      void this.tick();
    }, ORDER_PROGRESS_TICK_MS);
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  /**
   * Current status first, then each later transition. Comment heartbeats
   * keep proxies from closing a quiet stream.
   */
  stream(current: OrderStatusEvent): Observable<OrderStreamMessage> {
    return merge(
      of<OrderStreamMessage>({ type: 'order.status', data: current }),
      this.events.changes(current.orderId).pipe(
        map((event): OrderStreamMessage => ({
          type: 'order.status',
          data: event,
        })),
      ),
      interval(ORDER_STREAM_HEARTBEAT_MS).pipe(
        map((): OrderStreamMessage => ({ comment: 'ping' })),
      ),
    );
  }

  /** Advances every order that has spent a full step on its current status. */
  async advanceDueOrders(now: Date): Promise<number> {
    const cutoff = new Date(now.getTime() - ORDER_STATUS_STEP_MS);
    const due = await this.prisma.order.findMany({
      where: {
        status: { not: OrderStatus.DELIVERED },
        updatedAt: { lt: cutoff },
      },
      select: { id: true, status: true },
      orderBy: { updatedAt: 'asc' },
      take: DUE_ORDER_BATCH,
    });

    let advanced = 0;
    for (const order of due) {
      const next = nextOrderStatus(order.status);
      if (!next) continue;

      const updatedAt = now;
      // The status in the filter makes a second tick a no-op if this one
      // already moved the row.
      const result = await this.prisma.order.updateMany({
        where: { id: order.id, status: order.status },
        data: { status: next, updatedAt },
      });
      if (result.count !== 1) continue;

      this.events.publish({
        orderId: order.id,
        status: next,
        updatedAt: updatedAt.toISOString(),
      });
      this.logger.log(`Order ${order.id} is now ${next}`);
      advanced += 1;
    }
    return advanced;
  }

  private async tick(): Promise<void> {
    if (this.ticking) return;
    this.ticking = true;
    try {
      await this.advanceDueOrders(new Date());
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error.message : 'Order progress tick failed',
      );
    } finally {
      this.ticking = false;
    }
  }
}
