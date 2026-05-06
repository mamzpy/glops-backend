import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { StationController } from './station.controller';
import { StationService } from './station.service';

@Module({
  imports: [JwtModule],
  controllers: [StationController],
  providers: [StationService],
})
export class StationModule {}
