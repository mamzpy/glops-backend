import { BadRequestException, Injectable } from '@nestjs/common';

import { PladwayAdResult, PladwayVastExampleType } from './pladway.types';
import { PLADWAY_VAST_EXAMPLE_URLS } from './vast/vast.types';
import { VastResolverService } from './vast/vast-resolver.service';

@Injectable()
export class PladwayService {
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
}
