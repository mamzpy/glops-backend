import { Controller, Get, UseGuards } from '@nestjs/common';

import { CurrentDevice } from '../../common/decorators/current-device.decorator';
import { DeviceAuthGuard } from '../../common/guards/device-auth.guard';
import type { DeviceJwtPayload } from '../auth/types/device-jwt-payload.type';
import { CatalogService, type CatalogOfferResponse } from './catalog.service';

@Controller('catalog')
@UseGuards(DeviceAuthGuard)
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  getCatalog(
    @CurrentDevice() device: DeviceJwtPayload,
  ): Promise<CatalogOfferResponse[]> {
    return this.catalogService.getActiveOffers(device.stationId);
  }
}