import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';

export class CreateSquareDto {
  @ApiProperty({
    description: 'The unique identifier for the square',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  identificator: string;

  @ApiProperty({
    description: 'The image associated with the square',
    example: 'https://example.com/image.png',
    required: false,
  })
  image?: string;

  @ApiProperty({
    description: 'The coordinates of the square',
    example: { x: 10, y: 20 },
    required: false,
  })
  coordenates?: Record<string, any>;

  @ApiProperty({
    description: 'The dimensions of the square',
    example: { width: 100, height: 100 },
    required: false,
  })
  dimensions?: Record<string, any>;

  @ApiProperty({
    description: 'The ID of the employee associated with the square',
    example: 1,
    required: false,
  })
  employeeId?: number;

  @ApiProperty({
    description: 'The status of the square',
    enum: $Enums.SquareStatus,
    example: $Enums.SquareStatus.AVAILABLE,
    required: false,
  })
  status?: $Enums.SquareStatus;

  @ApiProperty({
    description: 'The ID of the graveyard associated with the square',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  graveyardsId: string;
  sectorId: string;
}
