import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { $Enums, MethodType } from '@prisma/client';

export class CreateManagementDto {
  @ApiProperty({
    example: 'Default Configuration',
    description: 'Name of the financial configuration.',
  })
  name: string;
}

export class CreateFinancialManagementDto {
  @ApiProperty({
    example: 'Default Plan',
    description: 'Name of the financial configuration.',
  })
  config_name: string;

  @ApiPropertyOptional({
    example: 'Configuration for installment payments',
    description: 'Detailed description of the financial configuration.',
  })
  description?: string;

  @ApiPropertyOptional({
    example: 2.5,
    description: 'Interest rate applied to overdue payments (% per month).',
  })
  interest_rate?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Penalty rate applied to overdue amounts (%).',
  })
  penalty_rate?: number;

  @ApiPropertyOptional({
    example: 5,
    description: 'Discount percentage for early payments (%).',
  })
  discount_rate?: number;

  @ApiPropertyOptional({
    example: 3,
    description: 'Minimum number of installments allowed for payments.',
  })
  min_installments?: number;

  @ApiPropertyOptional({
    example: 12,
    description: 'Maximum number of installments allowed for payments.',
  })
  max_installments?: number;

  @ApiPropertyOptional({
    example: 7,
    description:
      'Number of grace period days before interest/penalties are applied.',
  })
  payment_deadline_days?: number;

  @ApiProperty({
    example: true,
    description: 'Indicates whether the configuration is active.',
  })
  status: boolean;

  @ApiProperty({
    example: ['PIX', 'Credit Card', 'Bank Slip'],
    description: 'List of allowed payment methods.',
    isArray: true,
    enum: MethodType,
  })
  allowed_payment_methods: MethodType[];

  @ApiPropertyOptional({
    example: 1000,
    description: 'Minimum rent value for maintenance.',
    type: 'number',
  })
  minRentValue?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Requires approval for values below minimum rent value.',
    type: 'boolean',
  })
  requireApprovalMinRentValue?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Allows discounts for autonomous sellers.',
    type: 'boolean',
  })
  discountAutonomySellers?: boolean;
}
