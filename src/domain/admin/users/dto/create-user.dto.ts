import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'User mail' })
  email: string;

  @ApiProperty({
    example: 'strongpassword123',
    description: 'User password',
  })
  password: string;

  @ApiProperty({
    example: $Enums.Roles.USER,
    description: 'User role',
    enum: $Enums.Roles,
  })
  role: $Enums.Roles;

  @ApiProperty({ example: 'John Doe', description: 'Full name of User' })
  name: string;
}
