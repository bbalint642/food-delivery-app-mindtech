import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderDto, orderWithDetails } from './dto/order.dto';
import { OrderPricingError, PricedOrder, priceOrder } from './order-pricing';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates an order for the given customer. Prices are read from the menu
   * and the order is written atomically together with all of its lines.
   */
  async create(userId: string, dto: CreateOrderDto): Promise<OrderDto> {
    const order = await this.prisma.$transaction(async (tx) => {
      const restaurant = await tx.restaurant.findUnique({
        where: { id: dto.restaurantId },
        select: { id: true },
      });
      if (!restaurant) {
        throw new NotFoundException('Restaurant not found');
      }

      // Scoped to the restaurant: items of other restaurants are "not found".
      const menuItems = await tx.menuItem.findMany({
        where: {
          restaurantId: restaurant.id,
          id: { in: dto.items.map((item) => item.menuItemId) },
        },
        select: { id: true, name: true, priceCents: true, isAvailable: true },
      });

      const priced = this.price(dto, menuItems);

      return tx.order.create({
        data: {
          userId,
          restaurantId: restaurant.id,
          status: OrderStatus.PENDING,
          totalCents: priced.totalCents,
          items: {
            create: priced.lines.map((line) => ({
              menuItemId: line.menuItemId,
              name: line.name,
              unitPriceCents: line.unitPriceCents,
              quantity: line.quantity,
            })),
          },
        },
        include: orderWithDetails,
      });
    });

    return OrderDto.fromEntity(order);
  }

  /**
   * Returns an order only if it belongs to the customer. Someone else's
   * order yields the same 404 as a missing one, so ids cannot be probed.
   */
  async findOneForUser(orderId: string, userId: string): Promise<OrderDto> {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: orderWithDetails,
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return OrderDto.fromEntity(order);
  }

  private price(
    dto: CreateOrderDto,
    menuItems: Parameters<typeof priceOrder>[1],
  ): PricedOrder {
    try {
      return priceOrder(dto.items, menuItems);
    } catch (error) {
      if (error instanceof OrderPricingError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
