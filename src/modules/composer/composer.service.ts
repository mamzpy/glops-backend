import { Injectable } from '@nestjs/common';

import { PladwayService } from '../../infrastructure/external/pladway/pladway.service';
import type { PladwayImpressionResponse } from '../../infrastructure/external/pladway/pladway.types';
import type {
  ComposerAdPreviewInput,
  ComposerAdPreviewResponse,
} from './composer.types';

@Injectable()
export class ComposerService {
  constructor(private readonly pladwayService: PladwayService) {}

  async previewAd(
    input: ComposerAdPreviewInput,
  ): Promise<ComposerAdPreviewResponse> {
    const pladway = await this.pladwayService.requestAdForOpt({
      optId: input.optId,
      stationId: input.stationId,
      placementId: input.placementId,
    });

    return {
      optId: input.optId,
      stationId: input.stationId ?? null,
      placementId: input.placementId ?? null,
      selectedSource: pladway.available ? 'PLADWAY' : 'NONE',
      decisionReason: pladway.available
        ? 'PLADWAY_AD_AVAILABLE'
        : 'PLADWAY_NO_AD',
      pladway,
      localReservation: {
        available: false,
        reason: 'NOT_IMPLEMENTED',
      },
    };
  }

  async confirmAdImpression(input: {
    optId: string;
    stationId?: string;
    adId?: string | null;
    creativeId?: string | null;
    impressionUrls: string[];
  }): Promise<PladwayImpressionResponse> {
    return this.pladwayService.fireImpressions({
      optId: input.optId,
      stationId: input.stationId,
      adId: input.adId,
      creativeId: input.creativeId,
      impressionUrls: input.impressionUrls,
    });
  }
}
