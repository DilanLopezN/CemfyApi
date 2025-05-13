import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import {
  AssigneeHistoryDto,
  AssigneeHistoryScheduleDto,
} from './dto/create-assignee-history.dto';
import { AssigneeHistoryService } from './assignee.history.service';

@Controller('assignee-history')
export class AssigneeHistoryController {
  constructor(
    private readonly assigneeHistoryService: AssigneeHistoryService,
  ) {}

  @Get(':assigneeId')
  async getAssigneeHistory(@Param('assigneeId') assigneeId: string) {
    return this.assigneeHistoryService.getAssigneeHistory(+assigneeId);
  }

  @Post()
  async createHistory(@Body() createHistoryDto: AssigneeHistoryDto) {
    return this.assigneeHistoryService.createHistory(createHistoryDto);
  }

  @Post('schedule')
  async createAssigneeSchedule(
    @Body() scheduleDto: AssigneeHistoryScheduleDto,
  ) {
    return this.assigneeHistoryService.createAssigneeSchedule(scheduleDto);
  }
}
