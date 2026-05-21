import { Controller, Get, Body, Post, Query } from '@nestjs/common';
import { XiboService } from './xibo.service';
import { CreateXiboScheduleEventDto } from './dto/create-xibo-schedule-event.dto';
import { GetXiboScheduleEventsDto } from './dto/get-xibo-schedule-events.dto';

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

  @Get('schedule-events')
  getScheduleEvents(
    @Query() query: GetXiboScheduleEventsDto,
  ): Promise<unknown> {
    return this.xiboService.getScheduleEvents(query);
  }

  @Post('schedule-events')
  createScheduleEvent(
    @Body() body: CreateXiboScheduleEventDto,
  ): Promise<unknown> {
    return this.xiboService.createScheduleEvent(body);
  }
}
