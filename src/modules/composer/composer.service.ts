import { Injectable } from '@nestjs/common';

import type {
  ComposerAdPreviewInput,
  ComposerAdPreviewResponse,
} from './composer.types';

@Injectable()
export class ComposerService {
  previewAd(input: ComposerAdPreviewInput): ComposerAdPreviewResponse {
    return {
      optId: input.optId,
      stationId: input.stationId ?? null,
      placementId: input.placementId ?? null,
      selectedSource: 'NONE',
      decisionReason: 'NO_PROVIDER_IMPLEMENTED',
    };
  }
}
