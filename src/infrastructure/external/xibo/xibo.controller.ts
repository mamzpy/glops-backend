import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { CreateXiboScheduleEventDto } from './dto/create-xibo-schedule-event.dto';
import { GetXiboScheduleEventsDto } from './dto/get-xibo-schedule-events.dto';
import { XiboService } from './xibo.service';

@Controller('xibo')
export class XiboController {
  constructor(private readonly xiboService: XiboService) {}

  // OR1-109 demo: verifies that the backend can reach Xibo CMS and read platform metadata.
  @Get('about')
  getAbout(): Promise<unknown> {
    return this.xiboService.getAbout();
  }

  // OR1-109 demo: reads registered Xibo displays available for OPT content execution.
  @Get('displays')
  getDisplays(): Promise<unknown> {
    return this.xiboService.getDisplays();
  }

  // OR1-109 demo: reads Xibo display groups used as scheduling targets.
  @Get('display-groups')
  getDisplayGroups(): Promise<unknown> {
    return this.xiboService.getDisplayGroups();
  }

  // OR1-109 demo: reads layouts/campaign references that can be scheduled on OPT displays.
  @Get('layouts')
  getLayouts(): Promise<unknown> {
    return this.xiboService.getLayouts();
  }

  // OR1-109 demo: reads existing Xibo campaigns available for scheduling.
  @Get('campaigns')
  getCampaigns(): Promise<unknown> {
    return this.xiboService.getCampaigns();
  }

  // OR1-109 demo: reads scheduled content for a display group from Xibo.
  @Get('schedule-events')
  getScheduleEvents(
    @Query() query: GetXiboScheduleEventsDto,
  ): Promise<unknown> {
    return this.xiboService.getScheduleEvents(query);
  }

  // OR1-109 demo: creates a Xibo schedule event from a clean GLOPS-side JSON request.
  @Post('schedule-events')
  createScheduleEvent(
    @Body() body: CreateXiboScheduleEventDto,
  ): Promise<unknown> {
    return this.xiboService.createScheduleEvent(body);
  }
}
