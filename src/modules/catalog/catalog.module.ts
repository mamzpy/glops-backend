import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';

import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { COMMERCE_ADAPTER } from '../../infrastructure/external/commerce/commerce-adapter.interface';
import { StrapiCommerceAdapter } from '../../infrastructure/external/commerce/strapi/strapi-commerce.adapter';

@Module({
  imports: [HttpModule, JwtModule],
  controllers: [CatalogController],
  providers: [
    CatalogService,
    {
      provide: COMMERCE_ADAPTER,
      useClass: StrapiCommerceAdapter,
    },
  ],
})
export class CatalogModule {}