import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { CurrentDevice } from '../../common/decorators/current-device.decorator';
import { DeviceAuthGuard } from '../../common/guards/device-auth.guard';
import type { DeviceJwtPayload } from '../auth/types/device-jwt-payload.type';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderService } from './order.service';

@Controller('orders')
@UseGuards(DeviceAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  createOrder(
    @CurrentDevice() device: DeviceJwtPayload,
    @Body() dto: CreateOrderDto,
  ) {
    return this.orderService.createOrder(
      device.deviceId,
      device.stationId,
      dto,
    );
  }

  @Post(':orderId/checkout')
  checkout(
    @CurrentDevice() device: DeviceJwtPayload,
    @Param('orderId') orderId: string,
  ) {
    return this.orderService.checkout(
      orderId,
      device.deviceId,
      device.stationId,
    );
  }

  @Get(':orderId')
  getOrderById(
  @CurrentDevice() device: DeviceJwtPayload,
  @Param('orderId') orderId: string,
) {
  return this.orderService.getOrderById(orderId, device.deviceId, device.stationId);
}
}