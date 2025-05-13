import { ApiProperty } from '@nestjs/swagger';
import { $Enums, ExhumationReason } from '@prisma/client';

export class CreateExhumationDto {
  @ApiProperty({
    description: 'The date of the exhumation',
    example: '2025-03-15T10:00:00Z',
  })
  exhumationDate: Date;

  @ApiProperty({
    description: 'The description of the exhumation',
    example: 'Exhumation due to family request',
  })
  description: string;

  @ApiProperty({
    description: 'The reason for the exhumation',
    enum: $Enums.ExhumationReason,
    example: $Enums.ExhumationReason.FAMILY_REQUEST,
  })
  reason: ExhumationReason;

  @ApiProperty({
    description: 'The ID of the deceased',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  deceasedId: string;

  @ApiProperty({
    description: 'The ID of the drawer exhumed',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  drawersId: string;

  @ApiProperty({
    description: 'The date when the exhumation was performed',
    example: '2025-03-15T12:00:00Z',
    required: false,
  })
  performedAt?: Date;

  @ApiProperty({
    description: 'The destination after exhumation',
    example: 'New burial site',
    required: false,
  })
  destination?: string;
}
