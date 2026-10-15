import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export const DEFAULT_DEALS_LIMIT = 10;
export const MAX_DEALS_LIMIT = 20;

export class DealsQueryDto {
  @ApiPropertyOptional({
    minimum: 1,
    maximum: MAX_DEALS_LIMIT,
    default: DEFAULT_DEALS_LIMIT,
    description: 'Maximum number of deals to return.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_DEALS_LIMIT)
  limit: number = DEFAULT_DEALS_LIMIT;
}
