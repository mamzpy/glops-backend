import { Module } from '@nestjs/common';

import { PladwayModule } from '../../infrastructure/external/pladway/pladway.module';
import { ComposerController } from './composer.controller';
import { ComposerService } from './composer.service';

@Module({
  imports: [PladwayModule],
  controllers: [ComposerController],
  providers: [ComposerService],
})
export class ComposerModule {}
