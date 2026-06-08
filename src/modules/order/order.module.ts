import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';

import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { COMMERCE_ADAPTER } from '../../infrastructure/external/commerce/commerce-adapter.interface';
import { StrapiCommerceAdapter } from '../../infrastructure/external/commerce/strapi/strapi-commerce.adapter';

@Module({
  imports: [HttpModule, JwtModule],
  controllers: [OrderController],
  providers: [
    OrderService,
    {
      provide: COMMERCE_ADAPTER,
      useClass: StrapiCommerceAdapter,
    },
  ],
})
export class OrderModule {}
