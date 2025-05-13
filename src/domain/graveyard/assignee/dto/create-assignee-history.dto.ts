import { $Enums } from '@prisma/client';

export class AssigneeHistoryDto {
  observations: string;
  serviceType: $Enums.ServiceHistoryType;
  assigneeId: number;
}

export class AssigneeHistoryScheduleDto {
  scheduleDate: Date;
  schedulingReason: string;
  status: $Enums.ScheduleStatus;
  assigneeHistoryId: number;
}
