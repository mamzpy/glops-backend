import { Module } from '@nestjs/common';

import { ComposerController } from './composer.controller';
import { ComposerService } from './composer.service';

@Module({
  controllers: [ComposerController],
  providers: [ComposerService],
})
export class ComposerModule {}
