import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ListRestaurantsQueryDto } from './list-restaurants-query.dto';

/** Mirrors the global ValidationPipe (transform + validate). */
function parse(query: Record<string, unknown>) {
  const dto = plainToInstance(ListRestaurantsQueryDto, query);
  return { dto, errors: validateSync(dto, { whitelist: true }) };
}

describe('ListRestaurantsQueryDto', () => {
  it('parses repeated and comma-separated query values', () => {
    const { dto, errors } = parse({
      q: '  ramen ',
      cuisine: ['Olasz', 'Japán,Amerikai'],
      onSale: 'true',
      minRating: '4.5',
      priceLevel: '1,3',
    });

    expect(errors).toHaveLength(0);
    expect(dto).toEqual({
      q: 'ramen',
      cuisine: ['Olasz', 'Japán', 'Amerikai'],
      onSale: true,
      minRating: 4.5,
      priceLevel: [1, 3],
    });
  });

  it('accepts a single cuisine as a one-element array', () => {
    const { dto, errors } = parse({ cuisine: 'Olasz' });

    expect(errors).toHaveLength(0);
    expect(dto.cuisine).toEqual(['Olasz']);
  });

  it.each([
    [{ priceLevel: '4' }, 'priceLevel'],
    [{ minRating: '6' }, 'minRating'],
    [{ minRating: 'abc' }, 'minRating'],
    [{ onSale: 'yes' }, 'onSale'],
    [{ maxRating: '4.55' }, 'maxRating'],
    [{ minRating: '4.5', maxRating: '4.0' }, 'maxRating'],
  ])('rejects %j', (query, property) => {
    const { errors } = parse(query);

    expect(errors.map((e) => e.property)).toEqual([property]);
  });

  it('accepts a valid rating range, including min = max', () => {
    expect(parse({ minRating: '0', maxRating: '5' }).errors).toHaveLength(0);
    expect(parse({ minRating: '4.5', maxRating: '4.5' }).errors).toHaveLength(
      0,
    );
    expect(parse({ maxRating: '3' }).errors).toHaveLength(0);
  });
});
