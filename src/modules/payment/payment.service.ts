import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, PaymentStatus } from '@prisma/client';

import { PrismaService } from '../../infrastructure/database/prisma.service';
import { MockPaymentCallbackDto } from './dto/mock-payment-callback.dto';

type OrderWithItems = {
  items: {
    price: number;
    quantity: number;
  }[];
};

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async handleMockCallback(dto: MockPaymentCallbackDto) {
    const order = await this.prisma.order.findUnique({
      where: {
        id: dto.orderId,
      },
      include: {
        paymentAttempt: true,
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (!order.paymentAttempt) {
      throw new BadRequestException('Order has no payment attempt');
    }

    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new BadRequestException(
        `Order cannot receive payment callback from status ${order.status}`,
      );
    }

    const paymentStatus = dto.success
      ? PaymentStatus.CONFIRMED
      : PaymentStatus.FAILED;

    const orderStatus = dto.success ? OrderStatus.PAID : OrderStatus.FAILED;

    const updatedOrder = await this.prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: orderStatus,
        paymentAttempt: {
          update: {
            status: paymentStatus,
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