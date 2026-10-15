import { Module } from '@nestjs/common';
import { OrderEventsService } from './order-events.service';
import { OrderProgressService } from './order-progress.service';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, OrderEventsService, OrderProgressService],
})
export class OrdersModule {}
