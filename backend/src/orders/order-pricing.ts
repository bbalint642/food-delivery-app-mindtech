/**
 * Pure order pricing logic, free of persistence and HTTP concerns.
 *
 * Prices always come from the menu (the source of truth), never from the
 * client. Amounts are integer cents, so the arithmetic is exact.
 */

export interface RequestedItem {
  menuItemId: string;
  quantity: number;
}

export interface PriceableMenuItem {
  id: string;
  name: string;
  priceCents: number;
  isAvailable: boolean;
}

export interface PricedOrderLine {
  menuItemId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
}

export interface PricedOrder {
  lines: PricedOrderLine[];
  totalCents: number;
}

/** Largest value of a PostgreSQL INTEGER column. */
const MAX_TOTAL_CENTS = 2_147_483_647;

export class OrderPricingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = OrderPricingError.name;
  }
}

/**
 * @param requested items the customer wants
 * @param menuItems menu items of the ordered restaurant, looked up by the requested ids
 * @throws OrderPricingError if the order is empty, has duplicate items, or an
 *   item is not on this restaurant's menu or is unavailable
 */
export function priceOrder(
  requested: readonly RequestedItem[],
  menuItems: readonly PriceableMenuItem[],
): PricedOrder {
  if (requested.length === 0) {
    throw new OrderPricingError('An order must contain at least one item');
  }

  const requestedIds = new Set(requested.map((item) => item.menuItemId));
  if (requestedIds.size !== requested.length) {
    throw new OrderPricingError(
      'Each menu item may appear only once; use quantity instead',
    );
  }

  const menuById = new Map(menuItems.map((item) => [item.id, item]));

  const unknownIds = requested
    .map((item) => item.menuItemId)
    .filter((id) => !menuById.has(id));
  if (unknownIds.length > 0) {
    throw new OrderPricingError(
      `Menu items not found in this restaurant: ${unknownIds.join(', ')}`,
    );
  }

  const unavailable = requested
    .map((item) => menuById.get(item.menuItemId)!)
    .filter((menuItem) => !menuItem.isAvailable);
  if (unavailable.length > 0) {
    throw new OrderPricingError(
      `Menu items currently unavailable: ${unavailable.map((item) => item.name).join(', ')}`,
    );
  }

  const lines = requested.map(({ menuItemId, quantity }): PricedOrderLine => {
    const menuItem = menuById.get(menuItemId)!;
    return {
      menuItemId,
      name: menuItem.name,
      unitPriceCents: menuItem.priceCents,
      quantity,
      lineTotalCents: menuItem.priceCents * quantity,
    };
  });

  const totalCents = lines.reduce((sum, line) => sum + line.lineTotalCents, 0);
  if (totalCents > MAX_TOTAL_CENTS) {
    throw new OrderPricingError('Order total exceeds the allowed maximum');
  }

  return { lines, totalCents };
}
