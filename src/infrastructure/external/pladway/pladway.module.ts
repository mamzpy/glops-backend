import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { PladwayController } from './pladway.controller';
import { PladwayService } from './pladway.service';
import { VastResolverService } from './vast/vast-resolver.service';
import { PladwayCacheService } from './cache/pladway-cache.service';
import { LocalPladwayCacheStorageService } from './cache/local-pladway-cache-storage.service';
import { PLADWAY_CACHE_STORAGE } from './cache/pladway-cache-storage.interface';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10_000,
      maxRedirects: 3,
    }),
  ],
  controllers: [PladwayController],
  providers: [
    PladwayService,
    VastResolverService,
    PladwayCacheService,
    LocalPladwayCacheStorageService,
    {
      provide: PLADWAY_CACHE_STORAGE,
      useExisting: LocalPladwayCacheStorageService,
    },
  ],
  exports: [PladwayService],
})
export class PladwayModule {}
