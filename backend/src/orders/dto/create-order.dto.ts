import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsInt,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export const MAX_ITEM_QUANTITY = 99;
export const MAX_ORDER_LINES = 50;

export class CreateOrderItemDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  menuItemId!: string;

  @ApiProperty({ minimum: 1, maximum: MAX_ITEM_QUANTITY, example: 2 })
  @IsInt()
  @Min(1)
  @Max(MAX_ITEM_QUANTITY)
  quantity!: number;
}

/** Prices are intentionally absent: the server calculates them from the menu. */
export class CreateOrderDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  restaurantId!: string;

  @ApiProperty({
    type: [CreateOrderItemDto],
    minItems: 1,
    maxItems: MAX_ORDER_LINES,
    description: 'Each menu item may appear only once; use `quantity`.',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_ORDER_LINES)
  @ArrayUnique((item: CreateOrderItemDto) => item.menuItemId, {
    message: 'items must not contain the same menuItemId more than once',
  })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
