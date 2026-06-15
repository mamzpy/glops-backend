import { Module } from '@nestjs/common';

import { PladwayController } from './pladway.controller';
import { PladwayService } from './pladway.service';
import { VastResolverService } from './vast/vast-resolver.service';

@Module({
  controllers: [PladwayController],
  providers: [PladwayService, VastResolverService],
  exports: [PladwayService],
})
export class PladwayModule {}
