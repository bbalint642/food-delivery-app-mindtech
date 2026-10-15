import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { OrderStatus } from '../generated/prisma/client';

/** Payload of an `order.status` server-sent event. */
export interface OrderStatusEvent {
  orderId: string;
  status: OrderStatus;
  /** ISO-8601 timestamp of the transition. */
  updatedAt: string;
}

export type OrderStreamMessage =
  { type: 'order.status'; data: OrderStatusEvent } | { comment: 'ping' };

/**
 * In-process fan-out for order status changes. Each order has a channel
 * only while at least one customer is listening.
 */
@Injectable()
export class OrderEventsService {
  private readonly channels = new Map<string, Subject<OrderStatusEvent>>();

  publish(event: OrderStatusEvent): void {
    this.channels.get(event.orderId)?.next(event);
  }

  changes(orderId: string): Observable<OrderStatusEvent> {
    return new Observable((subscriber) => {
      const subject = this.channel(orderId);
      const subscription = subject.subscribe(subscriber);
      return () => {
        subscription.unsubscribe();
        if (!subject.observed) {
          this.channels.delete(orderId);
        }
      };
    });
  }

  private channel(orderId: string): Subject<OrderStatusEvent> {
    let subject = this.channels.get(orderId);
    if (!subject) {
      subject = new Subject<OrderStatusEvent>();
      this.channels.set(orderId, subject);
    }
    return subject;
  }
}
