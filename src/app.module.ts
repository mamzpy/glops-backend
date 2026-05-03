import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import configuration from './config/configuration';
import { validationSchema } from './config/validation.schema';

import { AuthModule } from './modules/auth/auth.module';
import { StationModule } from './modules/station/station.module';
import { SessionModule } from './modules/session/session.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { OrderModule } from './modules/order/order.module';
import { PaymentModule } from './modules/payment/payment.module';
import { FulfillmentModule } from './modules/fulfillment/fulfillment.module';
import { ContentModule } from './modules/content/content.module';
import { DatabaseModule } from './infrastructure/database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    AuthModule,
    StationModule,
    SessionModule,
    CatalogModule,
    OrderModule,
    PaymentModule,
    FulfillmentModule,
    ContentModule,
    DatabaseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
