import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateServiceDto } from './create-service.dto';

export class UpdateServiceDto extends PartialType(CreateServiceDto) {
  @ApiProperty({
    description: 'The ID of the service to update',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  id?: string;
}
