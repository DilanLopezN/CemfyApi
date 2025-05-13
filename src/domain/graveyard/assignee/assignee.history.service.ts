import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import {
  AssigneeHistoryDto,
  AssigneeHistoryScheduleDto,
} from './dto/create-assignee-history.dto';
@Injectable()
export class AssigneeHistoryService {
  constructor(private prismaService: PrismaService) {}

  async getAssigneeHistory(assigneeId: number) {
    const history = await this.prismaService.assigneeHistory.findMany({
      where: { assigneeId: assigneeId },
      include: {
        schedulings: true,
      },
    });
    return history;
  }

  async createHistory(createHistoryDto: AssigneeHistoryDto) {
    const history = await this.prismaService.assigneeHistory.create({
      data: {
        serviceType: createHistoryDto.serviceType,
        observations: createHistoryDto.observations,
        Assignee: {
          connect: {
            id: createHistoryDto.assigneeId,
          },
        },
      },
    });

    return history;
  }

  async createAssigneeSchedule(scheduleDto: AssigneeHistoryScheduleDto) {
    const scheduling = await this.prismaService.assigneeSchedule.create({
      data: {
        scheduleDate: scheduleDto.scheduleDate,
        schedulingReason: scheduleDto.schedulingReason,
        status: scheduleDto.status,
        AssigneeHistory: {
          connect: { id: scheduleDto.assigneeHistoryId },
        },
      },
    });
    return scheduling;
  }
}
