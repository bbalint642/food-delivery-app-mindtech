import {
  OrderPricingError,
  PriceableMenuItem,
  priceOrder,
} from './order-pricing';

const pizza: PriceableMenuItem = {
  id: 'pizza',
  name: 'Pizza',
  priceCents: 1190,
  isAvailable: true,
};
const tiramisu: PriceableMenuItem = {
  id: 'tiramisu',
  name: 'Tiramisù',
  priceCents: 650,
  isAvailable: true,
};
const soldOut: PriceableMenuItem = {
  id: 'sold-out',
  name: 'Matcha Mochi',
  priceCents: 550,
  isAvailable: false,
};

describe('priceOrder', () => {
  it('calculates line totals and the order total from menu prices', () => {
    const result = priceOrder(
      [
        { menuItemId: 'pizza', quantity: 2 },
        { menuItemId: 'tiramisu', quantity: 3 },
      ],
      [pizza, tiramisu],
    );

    expect(result.lines).toEqual([
      {
        menuItemId: 'pizza',
        name: 'Pizza',
        unitPriceCents: 1190,
        quantity: 2,
        lineTotalCents: 2380,
      },
      {
        menuItemId: 'tiramisu',
        name: 'Tiramisù',
        unitPriceCents: 650,
        quantity: 3,
        lineTotalCents: 1950,
      },
    ]);
    expect(result.totalCents).toBe(4330);
  });

  it('rejects items that are not on the restaurant menu', () => {
    expect(() =>
      priceOrder(
        [{ menuItemId: 'other-restaurant-item', quantity: 1 }],
        [pizza],
      ),
    ).toThrow(
      new OrderPricingError(
        'Menu items not found in this restaurant: other-restaurant-item',
      ),
    );
  });

  it('rejects unavailable items', () => {
    expect(() =>
      priceOrder([{ menuItemId: 'sold-out', quantity: 1 }], [soldOut]),
    ).toThrow(
      new OrderPricingError('Menu items currently unavailable: Matcha Mochi'),
    );
  });

  it('rejects duplicate items and empty orders', () => {
    expect(() =>
      priceOrder(
        [
          { menuItemId: 'pizza', quantity: 1 },
          { menuItemId: 'pizza', quantity: 2 },
        ],
        [pizza],
      ),
    ).toThrow(OrderPricingError);
    expect(() => priceOrder([], [pizza])).toThrow(OrderPricingError);
  });
});
