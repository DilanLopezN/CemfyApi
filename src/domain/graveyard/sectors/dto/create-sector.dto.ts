import { ApiProperty } from '@nestjs/swagger';

export class CreateSectorDto {
  @ApiProperty({
    description: 'The identificator of the sector',
    example: 'Sector-123',
  })
  identificator: string;

  @ApiProperty({
    description: 'The description of the sector',
    example: 'This sector is designated for VIP graves.',
  })
  description: string;
}

export class CreateSectorTagDto {
  tagName: string;
  tagHex: string;
  sectorId: string;
}
