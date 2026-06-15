import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CurrentDevice } from '../../common/decorators/current-device.decorator';
import { DeviceAuthGuard } from '../../common/guards/device-auth.guard';
import type { DeviceJwtPayload } from '../auth/types/device-jwt-payload.type';
import { ComposerService } from './composer.service';

@Controller('composer')
export class ComposerController {
  constructor(private readonly composerService: ComposerService) {}

  @Get('ad-preview')
  adPreview(
    @Query('optId') optId = '',
    @Query('stationId') stationId = '',
    @Query('placementId') placementId = '',
  ) {
    const normalizedOptId = optId.trim();

    if (!normalizedOptId) {
      throw new BadRequestException('optId is required');
    }

    return this.composerService.previewAd({
      optId: normalizedOptId,
      stationId: stationId.trim() || undefined,
      placementId: placementId.trim() || undefined,
    });
  }

  @Get('ad-preview/me')
  @UseGuards(DeviceAuthGuard)
  adPreviewForCurrentDevice(@CurrentDevice() device: DeviceJwtPayload) {
    return this.composerService.previewAd({
      optId: device.deviceId,
      stationId: device.stationId,
    });
  }
}
