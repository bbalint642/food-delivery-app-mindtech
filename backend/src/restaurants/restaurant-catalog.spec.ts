import {
  discountPercent,
  hasActiveDeal,
  priceLevelFor,
  shuffled,
} from './restaurant-catalog';

const item = (priceCents: number, overrides = {}) => ({
  priceCents,
  isAvailable: true,
  isOnSale: false,
  ...overrides,
});

describe('priceLevelFor', () => {
  it('derives the level from the average price of orderable items', () => {
    // Average 2 900 Ft, although one item alone would be level 3.
    expect(priceLevelFor([item(250_000), item(330_000)])).toBe(1);
  });

  it('maps averages onto the three levels', () => {
    expect(priceLevelFor([item(283_000)])).toBe(1);
    expect(priceLevelFor([item(313_000)])).toBe(2);
    expect(priceLevelFor([item(325_400)])).toBe(3);
  });

  it('ignores unavailable items and returns null when nothing is orderable', () => {
    expect(
      priceLevelFor([item(200_000), item(900_000, { isAvailable: false })]),
    ).toBe(1);
    expect(priceLevelFor([item(200_000, { isAvailable: false })])).toBeNull();
    expect(priceLevelFor([])).toBeNull();
  });
});

describe('hasActiveDeal', () => {
  it('requires an orderable item on sale', () => {
    expect(hasActiveDeal([item(1, { isOnSale: true })])).toBe(true);
    expect(
      hasActiveDeal([item(1, { isOnSale: true, isAvailable: false })]),
    ).toBe(false);
    expect(hasActiveDeal([item(1)])).toBe(false);
  });
});

describe('discountPercent', () => {
  it('returns the whole-percent discount', () => {
    expect(discountPercent(319_000, 399_000)).toBe(20);
    expect(discountPercent(161_000, 189_000)).toBe(15);
  });

  it('returns 0 for no or invalid discounts', () => {
    expect(discountPercent(399_000, 399_000)).toBe(0);
    expect(discountPercent(100, 0)).toBe(0);
  });
});

describe('shuffled', () => {
  it('returns a permutation without mutating the input', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffled(input, () => 0);

    expect(result).not.toBe(input);
    expect(input).toEqual([1, 2, 3, 4, 5]);
    expect([...result].sort()).toEqual([1, 2, 3, 4, 5]);
    // With random() = 0 every element is swapped with index 0 in turn.
    expect(result).toEqual([2, 3, 4, 5, 1]);
  });
});
