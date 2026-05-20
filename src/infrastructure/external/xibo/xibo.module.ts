import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import xiboConfig from './xibo.config';
import { XiboService } from './xibo.service';
import { XiboController } from './xibo.controller';

@Module({
  imports: [
    ConfigModule.forFeature(xiboConfig),

    HttpModule.register({
      timeout: 10_000,
      maxRedirects: 3,
    }),
  ],
  controllers: [XiboController],
  providers: [XiboService],
  exports: [XiboService],
})
export class XiboModule {}
