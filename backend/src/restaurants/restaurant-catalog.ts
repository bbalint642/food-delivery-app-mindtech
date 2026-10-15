/**
 * Pure catalogue helpers (no persistence or HTTP concerns), shared by the
 * restaurant list filters and the deals carousel.
 */

export type PriceLevel = 1 | 2 | 3;

export const PRICE_LEVELS: readonly PriceLevel[] = [1, 2, 3];

/**
 * Upper bounds (exclusive, in fillér) of the average menu price for price
 * levels 1 and 2; anything above is level 3. Tuned to the menu prices of
 * this catalogue (mains around 3 000–4 600 Ft, sides around 1 500 Ft).
 */
export const PRICE_LEVEL_THRESHOLDS_CENTS = [300_000, 320_000] as const;

export interface PricedMenuItem {
  priceCents: number;
  isAvailable: boolean;
  isOnSale: boolean;
}

/**
 * Price level (1 = cheapest … 3 = most expensive) from the average current
 * price of the orderable items, or null when nothing can be ordered.
 */
export function priceLevelFor(
  items: readonly PricedMenuItem[],
): PriceLevel | null {
  const prices = items
    .filter((item) => item.isAvailable)
    .map((item) => item.priceCents);
  if (prices.length === 0) return null;

  const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const [cheap, moderate] = PRICE_LEVEL_THRESHOLDS_CENTS;
  if (average < cheap) return 1;
  if (average < moderate) return 2;
  return 3;
}

/** True when at least one discounted item can actually be ordered. */
export function hasActiveDeal(items: readonly PricedMenuItem[]): boolean {
  return items.some((item) => item.isOnSale && item.isAvailable);
}

/** Whole-percent discount, e.g. 3 190 Ft instead of 3 990 Ft → 20. */
export function discountPercent(
  priceCents: number,
  compareAtPriceCents: number,
): number {
  if (compareAtPriceCents <= 0 || priceCents >= compareAtPriceCents) return 0;
  return Math.round((1 - priceCents / compareAtPriceCents) * 100);
}

/** Fisher–Yates shuffle returning a new array; `random` is injectable for tests. */
export function shuffled<T>(
  items: readonly T[],
  random: () => number = Math.random,
): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
