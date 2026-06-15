import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { PladwayController } from './pladway.controller';
import { PladwayService } from './pladway.service';
import { VastResolverService } from './vast/vast-resolver.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10_000,
      maxRedirects: 3,
    }),
  ],
  controllers: [PladwayController],
  providers: [PladwayService, VastResolverService],
  exports: [PladwayService],
})
export class PladwayModule {}
