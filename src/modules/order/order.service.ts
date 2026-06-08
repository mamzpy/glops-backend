import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, PaymentStatus } from '@prisma/client';

import { PrismaService } from '../../infrastructure/database/prisma.service';
import {
  COMMERCE_ADAPTER,
  type CommerceAdapter,
} from '../../infrastructure/external/commerce/commerce-adapter.interface';
import { CreateOrderDto } from './dto/create-order.dto';

type OrderItemSnapshot = {
  externalOfferId: string;
  offerName: string;
  price: number;
  quantity: number;
};

type OrderWithItems = {
  items: {
    price: number;
    quantity: number;
  }[];
};

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(COMMERCE_ADAPTER)
    private readonly commerceAdapter: CommerceAdapter,
  ) {}

  async createOrder(deviceId: string, stationId: string, dto: CreateOrderDto) {
    const orderItems: OrderItemSnapshot[] = [];

    for (const item of dto.items) {
      const offer = await this.commerceAdapter.getOfferById(
        item.offerId,
        stationId,
      );

      if (!offer) {
        throw new BadRequestException(
          `Offer ${item.offerId} is not available for this station`,
        );
      }

      orderItems.push({
  externalOfferId: offer.id,
  offerName: offer.name,
  price: offer.price,
  quantity: item.quantity,
});
    }

    const order = await this.prisma.order.create({
      data: {
        stationId,
        deviceId,
        status: OrderStatus.CREATED,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });

    return this.addTotalAmount(order);
  }

  async checkout(orderId: string, deviceId: string, stationId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        deviceId,
        stationId,
      },
      include: {
        items: true,
        paymentAttempt: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.CREATED) {
      throw new BadRequestException(
        `Order cannot be checked out from status ${order.status}`,
      );
    }

    if (order.paymentAttempt) {
      throw new BadRequestException('Order already has a payment attempt');
    }

    const updatedOrder = await this.prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: OrderStatus.PENDING_PAYMENT,
        paymentAttempt: {
          create: {
            status: PaymentStatus.PENDING_CONFIRMATION,
          },
        },
      },
      include: {
        items: true,
        paymentAttempt: true,
      },
    });

    return this.addTotalAmount(updatedOrder);
  }

  async getOrderById(orderId: string, deviceId: string, stationId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        deviceId,
        stationId,
      },
      include: {
        items: true,
        paymentAttempt: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.addTotalAmount(order);
  }

  private addTotalAmount<T extends OrderWithItems>(order: T) {
    const totalAmount = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    return {
      ...order,
      totalAmount,
    };
  }
}