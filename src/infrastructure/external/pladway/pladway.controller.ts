import { Controller, Get, Query } from '@nestjs/common';

import { PladwayService } from './pladway.service';
import type { PladwayAdResult, PladwayVastExampleType } from './pladway.types';

@Controller('pladway')
export class PladwayController {
  constructor(private readonly pladwayService: PladwayService) {}

  @Get('test-vast')
  testVast(@Query('type') type = 'full'): Promise<PladwayAdResult> {
    return this.pladwayService.testVast(type as PladwayVastExampleType);
  }
}
