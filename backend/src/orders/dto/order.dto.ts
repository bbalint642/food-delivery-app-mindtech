import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus, Prisma } from '../../generated/prisma/client';

/** Relations loaded whenever an order is returned to the client. */
export const orderWithDetails = {
  items: { orderBy: { name: 'asc' } },
  restaurant: { select: { id: true, name: true } },
} satisfies Prisma.OrderInclude;

export type OrderWithDetails = Prisma.OrderGetPayload<{
  include: typeof orderWithDetails;
}>;

export class OrderRestaurantDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Bella Napoli' })
  name!: string;
}

export class OrderItemDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  menuItemId!: string;

  @ApiProperty({
    example: 'Pizza Margherita',
    description: 'Name at the time of ordering.',
  })
  name!: string;

  @ApiProperty({
    example: 349000,
    description: 'Unit price in fillér (HUF) at the time of ordering.',
  })
  unitPriceCents!: number;

  @ApiProperty({ example: 2 })
  quantity!: number;

  @ApiProperty({ example: 698000 })
  lineTotalCents!: number;
}

export class OrderDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ enum: OrderStatus, enumName: 'OrderStatus' })
  status!: OrderStatus;

  @ApiProperty({ type: OrderRestaurantDto })
  restaurant!: OrderRestaurantDto;

  @ApiProperty({ type: [OrderItemDto] })
  items!: OrderItemDto[];

  @ApiProperty({ example: 698000, description: 'Order total in fillér (HUF).' })
  totalCents!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static fromEntity(order: OrderWithDetails): OrderDto {
    return {
      id: order.id,
      status: order.status,
      restaurant: order.restaurant,
      items: order.items.map((item) => ({
        id: item.id,
        menuItemId: item.menuItemId,
        name: item.name,
        unitPriceCents: item.unitPriceCents,
        quantity: item.quantity,
        lineTotalCents: item.unitPriceCents * item.quantity,
      })),
      totalCents: order.totalCents,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
