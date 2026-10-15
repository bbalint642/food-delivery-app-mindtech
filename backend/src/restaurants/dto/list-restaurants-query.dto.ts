import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  Validate,
  ValidatorConstraint,
  type ValidationArguments,
  type ValidatorConstraintInterface,
} from 'class-validator';
import { PRICE_LEVELS, type PriceLevel } from '../restaurant-catalog';

/** `?cuisine=Olasz&cuisine=Japán` and `?cuisine=Olasz,Japán` both become an array. */
const toStringArray = ({ value }: { value: unknown }): unknown[] => {
  const values: unknown[] = Array.isArray(value)
    ? (value as unknown[])
    : [value];
  return values
    .flatMap((entry): unknown[] =>
      typeof entry === 'string' ? entry.split(',') : [entry],
    )
    .map((entry) => (typeof entry === 'string' ? entry.trim() : entry))
    .filter((entry) => entry !== '');
};

const toNumberArray = (params: { value: unknown }): unknown[] =>
  toStringArray(params).map((entry) =>
    typeof entry === 'string' ? Number(entry) : entry,
  );

/** Query strings carry booleans as text; only explicit true/false are accepted. */
const toBoolean = ({ value }: { value: unknown }): unknown => {
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return value;
};

/** Rejects a rating range whose lower bound is above its upper bound. */
@ValidatorConstraint({ name: 'ratingRange' })
class RatingRangeConstraint implements ValidatorConstraintInterface {
  validate(maxRating: unknown, args: ValidationArguments): boolean {
    const { minRating } = args.object as { minRating?: unknown };
    if (typeof maxRating !== 'number' || typeof minRating !== 'number') {
      return true; // nothing to compare; type errors are reported elsewhere
    }
    return minRating <= maxRating;
  }

  defaultMessage(): string {
    return 'maxRating must not be less than minRating';
  }
}

export class ListRestaurantsQueryDto {
  @ApiPropertyOptional({
    description: 'Case-insensitive search in restaurant names and dish names.',
    example: 'ramen',
    maxLength: 100,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(100)
  q?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Cuisines to include (any of them). Repeat or comma-separate.',
    example: ['Olasz', 'Japán'],
  })
  @IsOptional()
  @Transform(toStringArray)
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(60, { each: true })
  cuisine?: string[];

  @ApiPropertyOptional({
    description: 'Only restaurants with at least one orderable item on sale.',
  })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  onSale?: boolean;

  @ApiPropertyOptional({
    description: 'Minimum guest rating (inclusive).',
    minimum: 0,
    maximum: 5,
    example: 4.5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(5)
  minRating?: number;

  @ApiPropertyOptional({
    description:
      'Maximum guest rating (inclusive). Must not be below `minRating`.',
    minimum: 0,
    maximum: 5,
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(5)
  @Validate(RatingRangeConstraint)
  maxRating?: number;

  @ApiPropertyOptional({
    type: [Number],
    enum: PRICE_LEVELS,
    description:
      'Price levels to include (1 = cheapest … 3 = most expensive), derived from the average menu price.',
    example: [1, 2],
  })
  @IsOptional()
  @Transform(toNumberArray)
  @IsIn(PRICE_LEVELS, { each: true })
  priceLevel?: PriceLevel[];
}
