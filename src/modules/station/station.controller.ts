import { Controller, Get, UseGuards } from '@nestjs/common';

import { CurrentDevice } from '../../common/decorators/current-device.decorator';
import { DeviceAuthGuard } from '../../common/guards/device-auth.guard';

import type { DeviceJwtPayload } from '../auth/types/device-jwt-payload.type';

@Controller('station')
export class StationController {
  @Get('me')
  @UseGuards(DeviceAuthGuard)
  getCurrentStation(
    @CurrentDevice() device: DeviceJwtPayload,
  ): DeviceJwtPayload {
    return device;
  }
}
