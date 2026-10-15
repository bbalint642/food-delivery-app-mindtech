import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Sse,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserDto } from '../users/dto/user.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderDto } from './dto/order.dto';
import { OrderStreamMessage } from './order-events.service';
import { OrderProgressService } from './order-progress.service';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing, invalid or expired token' })
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly orderProgress: OrderProgressService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Place an order for the logged-in customer',
    description:
      'Prices and the total are calculated on the server from the current menu. ' +
      'New orders start with status PENDING.',
  })
  @ApiCreatedResponse({ type: OrderDto })
  @ApiBadRequestResponse({
    description:
      'Validation failed, or an item is not on the restaurant’s menu or unavailable',
  })
  @ApiNotFoundResponse({ description: 'Restaurant not found' })
  create(
    @CurrentUser() user: UserDto,
    @Body() dto: CreateOrderDto,
  ): Promise<OrderDto> {
    return this.ordersService.create(user.id, dto);
  }

  @Sse(':id/events')
  @ApiOperation({
    summary: 'Stream live status updates for an order',
    description:
      'Server-Sent Events (`text/event-stream`). The first `order.status` event is the ' +
      'current status. Later events arrive as the order moves PENDING → CONFIRMED → ' +
      'PREPARING → DELIVERING → DELIVERED, one step about every 8 seconds. ' +
      'Event data is JSON: `{ orderId, status, updatedAt }`. ' +
      'Only the customer who placed the order can subscribe.',
  })
  @ApiProduces('text/event-stream')
  @ApiBadRequestResponse({ description: 'Invalid order id (not a UUID)' })
  @ApiNotFoundResponse({
    description: 'Order not found or belongs to another customer',
  })
  async events(
    @CurrentUser() user: UserDto,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Observable<OrderStreamMessage>> {
    const order = await this.ordersService.findOneForUser(id, user.id);
    return this.orderProgress.stream({
      orderId: order.id,
      status: order.status,
      updatedAt: new Date(order.updatedAt).toISOString(),
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order of the logged-in customer' })
  @ApiOkResponse({ type: OrderDto })
  @ApiBadRequestResponse({ description: 'Invalid order id (not a UUID)' })
  @ApiNotFoundResponse({
    description: 'Order not found or belongs to another customer',
  })
  findOne(
    @CurrentUser() user: UserDto,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<OrderDto> {
    return this.ordersService.findOneForUser(id, user.id);
  }
}
