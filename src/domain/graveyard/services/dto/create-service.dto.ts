import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({
    description: 'The name of the service',
    example: 'Grave Maintenance',
  })
  serviceName: string;

  @ApiProperty({
    description: 'The value of the service',
    example: 100,
    required: false,
  })
  serviceValue?: number;

  @ApiProperty({
    description: 'The duration of the service',
    example: '1 year',
    required: false,
  })
  serviceDuration?: string;

  @ApiProperty({
    description: 'Indicates if the service needs maintenance',
    example: true,
    required: false,
  })
  needMaintenance?: boolean;

  @ApiProperty({
    description: 'The ID of the graveyard',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  graveyardsId: string;
}
