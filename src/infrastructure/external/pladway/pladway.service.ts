import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import type {
  PladwayAdResult,
  PladwayVastExampleType,
} from './pladway.types';
import { PLADWAY_VAST_EXAMPLE_URLS } from './vast/vast.types';
import { VastResolverService } from './vast/vast-resolver.service';

@Injectable()
export class PladwayService {
  private readonly logger = new Logger(PladwayService.name);

  constructor(private readonly vastResolverService: VastResolverService) {}

  async testVast(type: PladwayVastExampleType): Promise<PladwayAdResult> {
    const url = PLADWAY_VAST_EXAMPLE_URLS[type];

    if (!url) {
      throw new BadRequestException(
        `Invalid VAST example type. Supported values: ${Object.keys(
          PLADWAY_VAST_EXAMPLE_URLS,
        ).join(', ')}`,
      );
    }

    return this.vastResolverService.resolve(url);
  }

  async requestAdForOpt(input: {
    optId: string;
    stationId?: string;
    placementId?: string;
  }): Promise<PladwayAdResult> {
    this.logger.log(
      `Requesting Pladway ad for optId=${input.optId}, stationId=${
        input.stationId ?? 'n/a'
      }, placementId=${input.placementId ?? 'n/a'}`,
    );

    // Temporary OR1-213 implementation:
    // use the official Pladway full VAST example until real Pladway key/OpenRTB docs arrive.
    return this.vastResolverService.resolve(PLADWAY_VAST_EXAMPLE_URLS.full);
  }
}
