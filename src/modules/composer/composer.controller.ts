import { BadRequestException, Controller, Get, Query } from '@nestjs/common';

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
}
