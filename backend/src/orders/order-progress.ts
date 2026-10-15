import { OrderStatus } from '../generated/prisma/client';

/** How long an order stays on each status before the next one. */
export const ORDER_STATUS_STEP_MS = 8_000;

/** How often the server looks for orders that are ready to advance. */
export const ORDER_PROGRESS_TICK_MS = 2_000;

const ORDER_STATUS_SEQUENCE: readonly OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PREPARING,
  OrderStatus.DELIVERING,
  OrderStatus.DELIVERED,
];

/** The status that follows `status`, or null when the order is already delivered. */
export function nextOrderStatus(status: OrderStatus): OrderStatus | null {
  const index = ORDER_STATUS_SEQUENCE.indexOf(status);
  if (index < 0 || index >= ORDER_STATUS_SEQUENCE.length - 1) {
    return null;
  }
  return ORDER_STATUS_SEQUENCE[index + 1];
}
