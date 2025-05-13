import { ApiProperty } from '@nestjs/swagger';

export class CreatePromotionDto {
  @ApiProperty({
    description: 'The name of the promotion',
    example: 'Summer Sale',
  })
  name: string;

  @ApiProperty({
    description: 'A brief description of the promotion',
    example: 'Get 20% off on all services during the summer!',
  })
  description: string;

  @ApiProperty({
    description: 'The discount percentage for the promotion',
    example: 20,
  })
  discount: number;

  @ApiProperty({
    description: 'The start date of the promotion',
    example: '2025-06-01T00:00:00Z',
  })
  startDate: Date;

  @ApiProperty({
    description: 'The end date of the promotion',
    example: '2025-08-31T23:59:59Z',
  })
  endDate: Date;
}

export class AssignPromotion {
  @ApiProperty({
    description: 'The ID of the promotion to assign',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  promotionId: string;

  @ApiProperty({
    description: 'Array of service IDs to assign the promotion to',
    example: ['service1', 'service2'],
    required: false,
  })
  servicesIds?: string[];

  @ApiProperty({
    description: 'Array of graveyard IDs to assign the promotion to',
    example: ['graveyard1', 'graveyard2'],
    required: false,
  })
  graveyards?: string[];

  @ApiProperty({
    description: 'Array of vault type IDs to assign the promotion to',
    example: [1, 2, 3],
    required: false,
  })
  vaultTypes?: number[];
}
