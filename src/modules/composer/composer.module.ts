import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { PladwayModule } from '../../infrastructure/external/pladway/pladway.module';
import { ComposerController } from './composer.controller';
import { ComposerService } from './composer.service';

@Module({
  imports: [JwtModule, PladwayModule],
  controllers: [ComposerController],
  providers: [ComposerService],
})
export class ComposerModule {}
