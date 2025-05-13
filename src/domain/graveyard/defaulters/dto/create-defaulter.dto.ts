import { DeliquencyStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDefaulterDto {
  @ApiProperty({ description: 'ID of the assignee' })
  assigneeId: number;

  @ApiProperty({ description: 'ID of the financial management entity' })
  financialManagementId: number;

  @ApiProperty({ description: 'Number of overdue days', required: false })
  overdue_days?: number;

  @ApiProperty({
    description: 'Due date of the payment',
    required: false,
    type: Date,
  })
  due_date?: Date;

  @ApiProperty({
    description: 'Date of the last payment',
    required: false,
    type: Date,
  })
  last_payment_date?: Date;

  @ApiProperty({ description: 'Outstanding amount', required: false })
  outstanding_amount?: number;

  @ApiProperty({ description: 'Status of delinquency', enum: DeliquencyStatus })
  status: DeliquencyStatus;
}
