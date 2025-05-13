import { ApiProperty } from '@nestjs/swagger';

export class CreateFuneralDto {
  @ApiProperty({
    description: 'The start date of the funeral',
    example: '2025-03-15T10:00:00Z',
  })
  startDate: Date;

  @ApiProperty({
    description: 'The end date of the funeral',
    example: '2025-03-15T12:00:00Z',
  })
  endDate: Date;

  @ApiProperty({
    description: 'The ID of the deceased',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  deceasedId: string;

  @ApiProperty({
    description: 'The ID of the funeral room',
    example: 1,
  })
  funeralRoomsId: number;
}
