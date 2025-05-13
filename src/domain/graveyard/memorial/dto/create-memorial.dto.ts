import { ApiProperty } from '@nestjs/swagger';

export class CreateMemorialDto {
  @ApiProperty({
    description: 'The ID of the deceased',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  deceasedId?: string;

  @ApiProperty({
    description: 'The birth date of the deceased',
    example: '1950-01-01',
  })
  bornOn: Date;

  @ApiProperty({
    description: 'The date of death of the deceased',
    example: '2025-01-01',
  })
  deceasedIin: Date;

  @ApiProperty({
    description: 'The image URL of the deceased',
    example: 'http://example.com/image.jpg',
  })
  deceaseImageUrl: string;
}

export class CreateHomageDto {
  @ApiProperty({
    description: 'The name of the person giving the tribute',
    example: 'John Doe',
    required: false,
  })
  tributeFrom?: string;

  @ApiProperty({
    description: 'The message of the tribute',
    example: 'In loving memory of...',
    required: false,
  })
  tributeMessage?: string;

  @ApiProperty({
    description: 'The image URL for the tribute',
    example: 'http://example.com/tribute.jpg',
    required: false,
  })
  imageUrl?: string;

  @ApiProperty({
    description: 'The kinship with the deceased',
    example: 'Brother',
    required: false,
  })
  kinship?: string;

  @ApiProperty({
    description: 'The token for the tribute',
    example: 'token123',
    required: false,
  })
  token?: string;
}
