import { ApiProperty } from '@nestjs/swagger';

export class CreateDrawerDto {
  @ApiProperty({
    description: 'The ID of the vault associated with the drawer',
    example: 1,
  })
  valtId: number;

  @ApiProperty({
    description: 'The sale value of the drawer',
    example: 5000.0,
  })
  saleValue: number;

  @ApiProperty({
    description: 'The rent value of the drawer',
    example: 200.0,
  })
  rentValue: number;

  @ApiProperty({
    description: 'The coordinates of the drawer',
    example: { x: 10, y: 20 },
  })
  coordenates: Record<string, any>;

  @ApiProperty({
    description: 'The dimensions of the drawer',
    example: { width: 100, height: 100 },
  })
  dimensions: Record<string, any>;

  @ApiProperty({
    description: 'The image associated with the drawer',
    example: 'https://example.com/image.png',
    required: false,
  })
  image?: string;

  @ApiProperty({
    description: 'The number of deceased supported by the drawer',
    example: 2,
    required: false,
  })
  deceasedSupported?: number;

  @ApiProperty({
    description: 'The unique identifier for the drawer',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  identificator: string;
}
