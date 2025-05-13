import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';

export class CreatePartnerDto {
  @ApiProperty({
    example: 'partner@example.com',
    description: 'Mail partner',
  })
  email: string;

  @ApiProperty({
    example: 'strongpassword123',
    description: 'Password partner',
  })
  password: string;

  @ApiProperty({
    example: $Enums.Roles.PARTNER,
    description: 'Partner Role',
    enum: $Enums.Roles,
  })
  role: $Enums.Roles;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full partner name',
  })
  name: string;

  @ApiProperty({
    example: 'Empresa XYZ',
    description: 'Partner corporation name',
  })
  partnerName: string;

  @ApiProperty({
    example: [$Enums.PartnerPermissions.READ, $Enums.PartnerPermissions.CREATE],
    description: 'Partner permissions',
    isArray: true,
    enum: $Enums.PartnerPermissions,
  })
  partnerPermissions: $Enums.PartnerPermissions[];

  @ApiProperty({
    example: 'https://example.com/avatar.png',
    description: 'Partner avatar URL',
    required: false,
  })
  avatar?: string;
}
