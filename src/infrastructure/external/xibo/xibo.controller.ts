import { Controller, Get, Param, Body, Post } from '@nestjs/common';
import { XiboService } from './xibo.service';
import { CreateXiboScheduleEventDto } from './dto/create-xibo-schedule-event.dto';

@Controller('xibo')
export class XiboController {
  constructor(private readonly xiboService: XiboService) {}

  @Get('displays')
  async getDisplays() {
    return this.xiboService.getDisplays();
  }

  @Get('about')
  async getAbout() {
    return this.xiboService.getAbout();
  }

  @Get('display-groups')
  async getDisplayGroups() {
    return this.xiboService.getDisplayGroups();
  }

  @Get('layouts')
  async getLayouts() {
    return this.xiboService.getLayouts();
  }

  @Get('campaigns')
  async getCampaigns() {
    return this.xiboService.getCampaigns();
  }

  @Get('display-groups/:displayGroupId/schedule-events')
  async getScheduleEvents(@Param('displayGroupId') displayGroupId: string) {
    return this.xiboService.getScheduleEvents(Number(displayGroupId));
  }

  @Post('schedule-events')
  createScheduleEvent(
    @Body() body: CreateXiboScheduleEventDto,
  ): Promise<unknown> {
    return this.xiboService.createScheduleEvent(body);
  }
}
