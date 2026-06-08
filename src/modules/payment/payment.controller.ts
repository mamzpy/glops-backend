import { Body, Controller, Post } from '@nestjs/common';

import { MockPaymentCallbackDto } from './dto/mock-payment-callback.dto';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('mock-callback')
  mockCallback(@Body() dto: MockPaymentCallbackDto) {
    return this.paymentService.handleMockCallback(dto);
  }
}