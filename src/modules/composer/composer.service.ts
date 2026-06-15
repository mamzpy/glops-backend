import { Injectable, Logger } from '@nestjs/common';

import { PladwayService } from '../../infrastructure/external/pladway/pladway.service';
import type { PladwayImpressionResponse } from '../../infrastructure/external/pladway/pladway.types';
import type {
  ComposerAdPreviewInput,
  ComposerAdPreviewResponse,
} from './composer.types';

@Injectable()
export class ComposerService {
  private readonly logger = new Logger(ComposerService.name);

  constructor(private readonly pladwayService: PladwayService) {}

  async previewAd(
    input: ComposerAdPreviewInput,
  ): Promise<ComposerAdPreviewResponse> {
    this.logger.log(
      `Composer preview requested: optId=${input.optId}, stationId=${
        input.stationId ?? 'n/a'
      }, placementId=${input.placementId ?? 'n/a'}`,
    );

    const pladway = await this.pladwayService.requestAdForOpt({
      optId: input.optId,
      stationId: input.stationId,
      placementId: input.placementId,
    });

    const selectedSource = pladway.available ? 'PLADWAY' : 'NONE';
    const decisionReason = pladway.available
      ? 'PLADWAY_AD_AVAILABLE'
      : 'PLADWAY_NO_AD';

    this.logger.log(
      `Composer decision: optId=${input.optId}, stationId=${
        input.stationId ?? 'n/a'
      }, selectedSource=${selectedSource}, reason=${decisionReason}, adId=${
        pladway.available ? (pladway.adId ?? 'n/a') : 'n/a'
      }`,
    );

    return {
      optId: input.optId,
      stationId: input.stationId ?? null,
      placementId: input.placementId ?? null,
      selectedSource,
      decisionReason,
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
    this.logger.log(
      `Composer impression confirmation received: optId=${
        input.optId
      }, stationId=${input.stationId ?? 'n/a'}, adId=${
        input.adId ?? 'n/a'
      }, creativeId=${input.creativeId ?? 'n/a'}, impressionCount=${
        input.impressionUrls.length
      }`,
    );

    const result = await this.pladwayService.fireImpressions({
      optId: input.optId,
      stationId: input.stationId,
      adId: input.adId,
      creativeId: input.creativeId,
      impressionUrls: input.impressionUrls,
    });

    this.logger.log(
      `Composer impression result: optId=${input.optId}, stationId=${
        input.stationId ?? 'n/a'
      }, successCount=${result.successCount}, failureCount=${
        result.failureCount
      }`,
    );

    return result;
  }
}
